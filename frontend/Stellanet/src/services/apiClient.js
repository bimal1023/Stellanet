export async function apiRequest(apiBase, path, options = {}) {
  const { method = "GET", token = "", body, headers = {} } = options;
  const mergedHeaders = { ...headers };
  if (token) mergedHeaders.Authorization = `Bearer ${token}`;
  if (body !== undefined) mergedHeaders["Content-Type"] = "application/json";
  const base = (apiBase || "").replace(/\/+$/, "");
  const route = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${base}${route}`, {
    method,
    headers: mergedHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail || data?.message || `${response.status} ${response.statusText}`;
    throw new Error(detail);
  }
  return data || {};
}
