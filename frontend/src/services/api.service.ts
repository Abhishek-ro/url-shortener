const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_KEY = import.meta.env.VITE_API_KEY;

export async function apiRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let text = '';
    try {
      text = await res.text();
    } catch {}
    throw new Error(text || 'Request failed');
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}
