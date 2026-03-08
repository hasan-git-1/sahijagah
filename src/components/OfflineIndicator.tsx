import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

const OfflineIndicator = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [showReconnect, setShowReconnect] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      setShowReconnect(true);
      setTimeout(() => setShowReconnect(false), 3000);
    };
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online && !showReconnect) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold transition-all ${
        online
          ? "bg-accent text-accent-foreground"
          : "bg-destructive text-destructive-foreground"
      }`}
    >
      {online ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          Back online
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          You're offline — some features may be limited
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;
