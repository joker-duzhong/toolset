import { useState, useEffect, useCallback, useRef } from 'react';
import { getSessionHistory, getSessionStatus, speakInBoard, createSSERequest, retrySession } from '../services/api';
import type { BoardMessage, BoardSession } from '../types';

export function useBoardDebate(sessionId: string | null) {
  const [messages, setMessages] = useState<BoardMessage[]>([]);
  const [status, setStatus] = useState<BoardSession['status']>('idle');
  const [sessionInfo, setSessionInfo] = useState<BoardSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 拉取历史消息与初始状态
  const initSession = useCallback(async (sid: string) => {
    setIsLoading(true);
    try {
      const [historyRes, statusRes] = await Promise.all([
        getSessionHistory(sid),
        getSessionStatus(sid)
      ]);
      
      if (historyRes.code === 200 && historyRes.data) {
        setMessages(historyRes.data.messages || []);
      }
      
      if (statusRes.code === 200 && statusRes.data) {
        setStatus(statusRes.data.status);
        setSessionInfo(statusRes.data);
      }
    } catch (err) {
      console.error('Failed to init board session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 断开 SSE 连接
  const disconnectStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  // 连接 SSE 流
  const connectStream = useCallback(async (sid: string) => {
    disconnectStream(); // 确保旧连接断开

    abortControllerRef.current = new AbortController();
    let readBuffer = '';

    try {
      const streamBody = await createSSERequest(sid, abortControllerRef.current.signal);
      if (!streamBody) return;

      const reader = streamBody.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;
        if (!value) continue;

        readBuffer += decoder.decode(value, { stream: true });

        const chunks = readBuffer.split('\n\n');
        readBuffer = chunks.pop() || ''; // 保存最后一段不完整的 chunk

        for (const chunk of chunks) {
          if (chunk.startsWith('data: ')) {
            const dataStr = chunk.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              handleStreamEvent(data);
            } catch (e) {
              console.error('Parse chunk error', e);
            }
          } else if (chunk.startsWith('event: done')) {
             setStatus('idle');
             disconnectStream();
             // Fetch full history to ensure state consistency
             if (sid) {
               initSession(sid);
             }
             break;
          }
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name !== 'AbortError') {
        console.error('SSE Error:', err);
      }
    }
  }, [disconnectStream, initSession]);

  // 处理接收到的流事件
  const handleStreamEvent = (data: {
    status?: 'idle' | 'scoring' | 'speaking' | 'paused' | 'done' | 'error',
    chunk?: string,
    role?: string,
    session_id?: string,
    message?: string,
    error?: string
  }) => {
    if (data.status) {
      setStatus(data.status);

      // 处理错误状态
      if (data.status === 'error') {
        setError(data.message || data.error || '任务执行失败');
        disconnectStream();
        return;
      }

      if (data.status === 'idle') {
        setError(null); // 清除错误
        disconnectStream(); // 主动断开
      }
    }

    if (data.chunk && data.role) {
      // 流式插入：查最后一条消息是否为此人，如果是则追加文本，否则新增一条发言
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === data.role && !lastMsg.is_finalized) {
          return [
            ...prev.slice(0, prev.length - 1),
            { ...lastMsg, content: lastMsg.content + data.chunk }
          ];
        } else {
          // 当前角色的全新气泡
          return [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              session_id: data.session_id || '',
              role: data.role,
              content: data.chunk || '',
              is_finalized: false,
              created_at: new Date().toISOString()
            }
          ];
        }
      });
    }
  };

  // 用户发言
  const sendMessage = useCallback(async (text: string, newTopic?: string) => {
    if (!text.trim()) return;

    const sid = sessionId || undefined;

    // Optimistic UI updates
    const tempMsg: BoardMessage = {
      id: `temp-${Date.now()}`,
      session_id: sid || '',
      role: 'CEO', // 代表用户
      content: text,
      is_finalized: true,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMsg]);
    setStatus('scoring');
    setError(null); // 清除之前的错误

    try {
      const res = await speakInBoard({ text, topic: newTopic, session_id: sid });
      if (res.code === 200 && res.data) {
        const newSessionId = res.data.session_id;

        // 立即建立 SSE 连接
        connectStream(newSessionId);

        // 如果是新会话，返回 session_id 供父组件处理（如路由跳转）
        if (!sessionId) {
          return newSessionId;
        }
      }
    } catch (error) {
       console.error('Speak failed:', error);
       setStatus('idle');
       setError('发送消息失败，请重试');
    }
  }, [sessionId, connectStream]);

  // 重试失败的任务
  const retry = useCallback(async () => {
    if (!sessionId) return;

    setError(null);
    setStatus('scoring');

    try {
      const res = await retrySession(sessionId);
      if (res.code === 200) {
        // 重新建立 SSE 连接
        connectStream(sessionId);
      }
    } catch (error) {
      console.error('Retry failed:', error);
      setStatus('error');
      setError('重试失败，请稍后再试');
    }
  }, [sessionId, connectStream]);

  useEffect(() => {
    if (sessionId) {
      initSession(sessionId);
    }
    
    return () => {
      disconnectStream();
    };
  }, [sessionId, initSession, disconnectStream]);

  // 状态自动接管判断
  useEffect(() => {
    if (sessionId && (status === 'speaking' || status === 'scoring')) {
      connectStream(sessionId);
    }
  }, [sessionId, status, connectStream]);

  return { messages, status, sessionInfo, isLoading, error, sendMessage, retry, refresh: () => sessionId && initSession(sessionId) };
}
