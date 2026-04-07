/**
 * 微信网页授权工具函数
 * 提供判断微信环境、跳转授权、解析 code 以及完整的静默登录封装
 * 方便复用到其他 TypeScript/React/Vue 项目中
 */

/**
 * 判断当前是否在微信浏览器中
 * @returns {boolean} 是否为微信浏览器环境
 */
export const isWechatBrowser = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger/.test(ua);
};

/**
 * 跳转微信授权页面获取 code
 * 
 * @param appId 微信公众号的 appId
 * @param redirectUri 授权后重定向的回调链接地址，默认为当前页面
 * @param scope 授权作用域：snsapi_base (静默，仅openid)，snsapi_userinfo (需确认，可获取用户信息)
 * @param state 传递参数，重定向后原样带回
 */
export const redirectToWechatAuth = (
  appId: string,
  redirectUri: string = window.location.href,
  scope: 'snsapi_base' | 'snsapi_userinfo' = 'snsapi_base',
  state: string = 'STATE'
): void => {
  const encodedUrl = encodeURIComponent(redirectUri);
  const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodedUrl}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
  
  // 使用 replace 避免授权页产生历史记录
  window.location.replace(url);
};

/**
 * 从当前 URL 参数中提取微信重定向带回的 code
 * @returns {string | null} 返回 code，如果没有则返回 null
 */
export const getWechatCodeFromUrl = (): string | null => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('code');
};

/**
 * 清除 URL 中的 code 及其它单次有效的微信参数，防止页面刷新时重复使用已过期的 code 报错
 */
export const removeWechatParamsFromUrl = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  window.history.replaceState({}, document.title, url.toString());
};

/**
 * 微信登录完整流程封装（支持静默授权和用户信息授权）
 * 
 * 流程：
 * 1. 检查前端 URL 是否带有 code。
 * 2. 如果没有 code，构造微信授权链接（根据传入的 scope 选择静默或用户授权）并重定向。
 * 3. 如果有 code，清除 URL 里的 code 参数，并调用传入的后端请求函数去换取 openid 或 token 等信息。
 * 
 * @param appId 微信公众号 appId
 * @param loginApiFn 你的后端登录请求接口封装
 * @param scope 授权作用域：snsapi_base (默认，静默，仅获取 openid)，snsapi_userinfo (需用户确认，可获取昵称、头像等用户信息)
 * @param redirectUri 可选：自定义重定向跳转回来的 URL 
 * @returns {Promise<T | null>} 后端接口的返回值
 * 
 * @example
 * // 使用示例：
 * async function login() {
 *   const data = await wechatLogin('wx1234567890abcdef', async (code) => {
 *     // 调用你的后端接口
 *     const response = await fetch('https://api.lxyy.fun/api/v1/auth/wechat-login', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ code: code, state: 'some_state_if_needed' })
 *     });
 *     return response.json();
 *   }, 'snsapi_userinfo'); // 传入 'snsapi_userinfo' 获取用户信息
 *   
 *   if (data) {
 *     console.log('登录成功，已拿到凭证或用户信息', data);
 *   }
 * }
 */
export const wechatLogin = async <T,>(
  appId: string,
  loginApiFn: (code: string) => Promise<T>,
  scope: 'snsapi_base' | 'snsapi_userinfo' = 'snsapi_base',
  redirectUri?: string
): Promise<T | null> => {
  if (!isWechatBrowser()) {
    console.warn('当前不是微信浏览器环境，跳过微信专属登录流程');
    return null;
  }

  const code = getWechatCodeFromUrl();

  if (!code) {
    // 1. 没有 code，说明还没授权过，进行重定向跳转
    redirectToWechatAuth(appId, redirectUri || window.location.href, scope);
    // 返回一个一直 pending 的 promise，等待页面被重定向终止，避免后续代码执行
    return new Promise(() => {});
  } else {
    // 2. 有 code，说明是从微信授权调回来的
    try {
      // 及时清理 URL 里的 code，让 url 保持干净，防止用户刷新页面导致 code 重复消耗报错
      removeWechatParamsFromUrl();
      
      // 3. 将 code 提交给调用的开发者后端换取 session / token / openid
      const result = await loginApiFn(code);
      return result;
    } catch (error) {
      console.error('微信静默登录调用后端接口失败:', error);
      throw error;
    }
  }
};
