const TOKEN_KEY = "delcom_token";

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const putAccessToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeAccessToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Wrapper fetch untuk Delcom REST API.
 * Melempar Error (dengan properti `data`) jika status bukan "success".
 */
export async function apiFetch(path: string, { method = "GET", body, params, auth = true }: { method?: string; body?: any; params?: Record<string, any>; auth?: boolean } = {}) {
  const url = new URL(DELCOM_BASEURL.replace(/\/$/, "") + path);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const isForm = body instanceof FormData;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  const response = await fetch(url, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const json = await response.json().catch(() => ({ status: "fail", message: "Respons server tidak valid" }));

  if (json.status !== "success") {
    const error: any = new Error(json.message || "Terjadi kesalahan");
    error.data = json.data;
    throw error;
  }
  return json;
}
