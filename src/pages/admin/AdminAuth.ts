// Admin credentials. Override via VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD if set.
export const ADMIN_EMAIL =
  (import.meta.env.VITE_ADMIN_EMAIL as string) || "admin@urbanstay.com";
export const ADMIN_PASSWORD =
  (import.meta.env.VITE_ADMIN_PASSWORD as string) || "urbanStay@2026";

const KEY = "urbanstay_admin_auth";

export const isAdminAuthed = () =>
  typeof window !== "undefined" && sessionStorage.getItem(KEY) === "true";

export const setAdminAuthed = (v: boolean) => {
  if (v) sessionStorage.setItem(KEY, "true");
  else sessionStorage.removeItem(KEY);
};
