import { getStoredTokens, setStoredTokens, clearStoredTokens } from "@/utils/storage";

export const API_BASE = false && import.meta.env.DEV ? "http://localhost:8000/api/v1" : "https://api.lxyy.fun/api/v1";

export const WECHAT_APP_ID = import.meta.env.DEV ? "wxea6611dfdc3ecc4f" : "wx29ee8c1ad373bafa";

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const tokens = getStoredTokens();
    if (!tokens) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: tokens.refreshToken }),
      });
      if (!res.ok) return false;

      const json: ApiResponse<{ access_token: string; refresh_token: string; token_type: string }> = await res.json();
      if (!json.data) return false;

      setStoredTokens(json.data);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiClient<T>(input: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const tokens = getStoredTokens();

  const headers = new Headers(init?.headers);
  if (tokens) {
    headers.set("Authorization", `Bearer ${tokens.accessToken}`);
  }
  if (!headers.has("Content-Type") && init?.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${input}`, {
    ...init,
    headers,
  });

  if (res.status === 401 && tokens) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newTokens = getStoredTokens()!;
      const retryHeaders = new Headers(init?.headers);
      retryHeaders.set("Authorization", `Bearer ${newTokens.accessToken}`);
      if (!retryHeaders.has("Content-Type") && init?.body) {
        retryHeaders.set("Content-Type", "application/json");
      }

      const retryRes = await fetch(`${API_BASE}${input}`, {
        ...init,
        headers: retryHeaders,
      });
      return retryRes.json();
    }

    clearStoredTokens();
  }

  return res.json();
}
