/**
 * Detects whether the app is running as an installed app (PWA standalone
 * or inside a Capacitor native shell) rather than a normal browser tab.
 */
export const isAppMode = (): boolean => {
  if (typeof window === "undefined") return false;
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: fullscreen)").matches ||
    // iOS Safari
    (window.navigator as any).standalone === true;
  const capacitor = !!(window as any).Capacitor?.isNativePlatform?.();
  return !!standalone || capacitor;
};
