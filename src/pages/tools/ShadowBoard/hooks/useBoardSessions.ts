import { useState, useCallback, useEffect } from 'react';
import { getSessions } from '../services/api';
import type { BoardSession } from '../types';

export function useBoardSessions() {
  const [sessions, setSessions] = useState<BoardSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSessions();
      if (res.code === 200 && res.data) {
        setSessions(res.data.sessions || []);
        setError(null);
      } else {
        setError(res.message || '获取会话列表失败');
      }
    } catch (err: unknown) {
      setError((err as Error).message || '网络连接失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, error, refresh: fetchSessions };
}
