import { apiRequest } from "./apiClient";

export async function discoverProfessors(apiBase, payload) {
  const data = await apiRequest(apiBase, "/discover", {
    method: "POST",
    body: payload,
  });
  return data?.results || [];
}
