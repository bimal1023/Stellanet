import { apiRequest } from "./apiClient";

export async function fetchCurrentUser(apiBase, token) {
  const data = await apiRequest(apiBase, "/auth/me", { token });
  return data?.user || null;
}

export async function authSubmit(apiBase, mode, form) {
  const email = (form.email || "").trim();
  const password = form.password || "";
  const fullName = (form.full_name || "").trim();
  const verificationToken = (form.verification_token || "").trim();
  const resetToken = (form.reset_token || "").trim();
  const newPassword = form.new_password || "";
  const rememberMe = !!form.remember_me;

  if (mode === "signup") {
    return apiRequest(apiBase, "/auth/signup", {
      method: "POST",
      body: { full_name: fullName, email, password, remember_me: rememberMe },
    });
  }
  if (mode === "signin") {
    return apiRequest(apiBase, "/auth/signin", {
      method: "POST",
      body: { email, password, remember_me: rememberMe },
    });
  }
  if (mode === "verify") {
    return apiRequest(apiBase, "/auth/verify-email", {
      method: "POST",
      body: { email, verification_token: verificationToken },
    });
  }
  if (mode === "forgot") {
    return apiRequest(apiBase, "/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  }
  if (mode === "reset") {
    return apiRequest(apiBase, "/auth/reset-password", {
      method: "POST",
      body: { reset_token: resetToken, new_password: newPassword },
    });
  }
  throw new Error("Unsupported auth mode");
}

export async function authSignout(apiBase, token) {
  if (!token) return { ok: true };
  return apiRequest(apiBase, "/auth/signout", { method: "POST", token });
}
