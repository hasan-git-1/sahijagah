import { useState } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PushNotificationSetup = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [subscribed, setSubscribed] = useState(false);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Push notifications not supported in this browser");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      setSubscribed(true);
      toast.success("Push notifications enabled!");
      // Show a test notification
      new Notification("urbanStay", {
        body: "You'll now receive updates on new listings and bookings!",
        icon: "/pwa-192.png",
      });
    } else if (result === "denied") {
      toast.error("Notifications blocked. Enable in browser settings.");
    }
  };

  if (permission === "granted" || subscribed) {
    return (
      <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Check className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Notifications Enabled</p>
          <p className="text-xs text-muted-foreground">You'll get alerts for new listings & bookings</p>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <BellOff className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Notifications Blocked</p>
          <p className="text-xs text-muted-foreground">Enable in your browser settings to receive alerts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Enable Push Notifications</p>
          <p className="text-xs text-muted-foreground">Get alerts for new listings, bookings & messages</p>
        </div>
      </div>
      <Button onClick={requestPermission} className="w-full gradient-blue text-primary-foreground border-0 gap-2">
        <Bell className="h-4 w-4" /> Enable Notifications
      </Button>
    </div>
  );
};

export default PushNotificationSetup;
