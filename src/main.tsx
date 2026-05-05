import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Auto-update service worker — reload page when a new version is available
// so users always see the latest deploy without stale caches.
if ("serviceWorker" in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      updateSW(true);
    },
    onRegisteredSW(_swUrl, registration) {
      // Periodically check for updates (every 60s) so long-open tabs refresh
      if (registration) {
        setInterval(() => registration.update().catch(() => {}), 60_000);
      }
    },
  });
}
