import { useState } from "react";
import { CalendarClock, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AutoRenewalReminderProps {
  propertyTitle: string;
  leaseEndDate?: string;
}

const AutoRenewalReminder = ({ propertyTitle, leaseEndDate }: AutoRenewalReminderProps) => {
  const [enabled, setEnabled] = useState(false);
  const endDate = leaseEndDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const daysLeft = Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const toggle = () => {
    setEnabled(!enabled);
    toast.success(enabled ? "Reminder removed" : "Reminder set! We'll notify you 30 days before lease ends.");
  };

  const urgency = daysLeft <= 30 ? "text-destructive" : daysLeft <= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-accent";

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-2">
        <CalendarClock className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-foreground text-sm">Lease Renewal</h3>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className={`text-lg font-extrabold ${urgency}`}>{daysLeft} days left</p>
          <p className="text-[10px] text-muted-foreground">
            Lease ends {new Date(endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <Button
          onClick={toggle}
          variant={enabled ? "outline" : "default"}
          size="sm"
          className={`gap-1.5 ${!enabled ? "gradient-blue text-primary-foreground border-0" : ""}`}
        >
          {enabled ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
          {enabled ? "Remove" : "Remind Me"}
        </Button>
      </div>
    </div>
  );
};

export default AutoRenewalReminder;
