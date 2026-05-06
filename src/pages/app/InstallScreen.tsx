import { useState, useEffect } from "react";
import { Download, Smartphone, CheckCircle, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const InstallScreen = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <CheckCircle className="h-16 w-16 text-accent mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">App Installed!</h2>
        <p className="text-sm text-muted-foreground mb-6">urbanStay is installed on your device.</p>
        <Button onClick={() => navigate("/app")} className="gradient-blue text-primary-foreground border-0">Open App</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="h-20 w-20 rounded-2xl gradient-blue flex items-center justify-center mb-6 shadow-elevated">
        <Smartphone className="h-10 w-10 text-primary-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Install urbanStay</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Install our app for a faster, offline-capable experience. Works just like a native app!
      </p>

      <div className="w-full max-w-sm space-y-3 mb-8">
        {[
          { icon: "⚡", text: "Loads instantly, even offline" },
          { icon: "🔔", text: "Get push notifications for new properties" },
          { icon: "📱", text: "Full-screen native app feel" },
          { icon: "💾", text: "Takes less than 1MB of storage" },
        ].map((f) => (
          <div key={f.text} className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 shadow-card text-left">
            <span className="text-lg">{f.icon}</span>
            <p className="text-sm text-foreground">{f.text}</p>
          </div>
        ))}
      </div>

      {isIOS ? (
        <div className="bg-card rounded-2xl p-5 shadow-card w-full max-w-sm text-left space-y-3">
          <p className="font-semibold text-foreground text-sm">To install on iPhone/iPad:</p>
          <div className="flex items-start gap-3">
            <Share className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">Tap the <strong>Share</strong> button in Safari</p>
          </div>
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">Select <strong>"Add to Home Screen"</strong></p>
          </div>
        </div>
      ) : deferredPrompt ? (
        <Button onClick={handleInstall} className="gradient-cta text-accent-foreground border-0 px-8 py-3 font-semibold gap-2">
          <Download className="h-5 w-5" /> Install App
        </Button>
      ) : (
        <div className="bg-card rounded-2xl p-5 shadow-card w-full max-w-sm">
          <p className="text-sm text-muted-foreground">
            Open this page in <strong>Chrome</strong> on your phone, then tap the menu → <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
          </p>
        </div>
      )}

      <button onClick={() => navigate("/app")} className="mt-6 text-sm text-primary font-medium">
        Continue in browser →
      </button>
    </div>
  );
};

export default InstallScreen;
