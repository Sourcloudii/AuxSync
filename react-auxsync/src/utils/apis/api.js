export async function checkResponse(res, fallbackError) {
  if (res.ok) return res.json();
  const data = await res.json().catch(() => ({}));
  throw new Error(data.detail || data.error || fallbackError || `Error: ${res.status}`);
}

export const API_BASE = import.meta.env.VITE_API_BASE ?? "";