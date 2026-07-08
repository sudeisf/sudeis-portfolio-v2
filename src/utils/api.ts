export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const res = await apiFetch('/api/admin/verify');
    if (!res.ok) return false;
    const data = await res.json();
    return data.authenticated === true;
  } catch {
    return false;
  }
}
