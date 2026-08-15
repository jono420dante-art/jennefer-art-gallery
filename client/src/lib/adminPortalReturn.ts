const ADMIN_PORTAL_RETURN_KEY = "jennefer-admin-portal-return";

export function toSafeAdminPortalPath(value: string | null | undefined) {
  if (!value) return null;
  return value === "/admin" || value.startsWith("/admin?") || value === "/admin-dashboard" || value.startsWith("/admin-dashboard?")
    ? value
    : null;
}

export function rememberAdminPortalReturn(path: string) {
  const safePath = toSafeAdminPortalPath(path);
  if (safePath && typeof window !== "undefined") {
    window.sessionStorage.setItem(ADMIN_PORTAL_RETURN_KEY, safePath);
  }
}

export function consumeAdminPortalReturn() {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(ADMIN_PORTAL_RETURN_KEY);
  window.sessionStorage.removeItem(ADMIN_PORTAL_RETURN_KEY);
  return toSafeAdminPortalPath(value);
}
