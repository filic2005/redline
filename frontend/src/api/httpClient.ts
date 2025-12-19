import { supabase } from '../utils/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_PREFIX = `${API_BASE_URL}/api`;

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function apiFetch<T>(
  path: string,
  { skipAuth, ...init }: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  if (!skipAuth) {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Missing auth session');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return null as unknown as T;
  }

  return res.json() as Promise<T>;
}
