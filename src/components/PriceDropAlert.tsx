import { useState, useEffect } from "react";
import { Bell, BellOff, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PriceDropAlertProps {
  propertyId: string;
  propertyTitle: string;
  currentPrice: number;
}

const STORAGE_KEY = "urbanstay-price-alerts";

const getAlerts = (): string[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

const PriceDropAlert = ({ propertyId, propertyTitle, currentPrice }: PriceDropAlertProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const alerts = getAlerts();
    setEnabled(alerts.includes(propertyId));
  }, [propertyId]);

  const toggle = () => {
    const alerts = getAlerts();
    let updated: string[];
    if (enabled) {
      updated = alerts.filter((id) => id !== propertyId);
      toast.success("Price alert removed");
    } else {
      updated = [...alerts, propertyId];
      toast.success("You'll be notified when the price drops!");
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEnabled(!enabled);
  };

  return (
    <Button
      onClick={toggle}
      variant={enabled ? "outline" : "default"}
      size="sm"
      className={`gap-1.5 text-xs ${!enabled ? "gradient-blue text-primary-foreground border-0" : ""}`}
    >
      {enabled ? (
        <>
          <BellOff className="h-3.5 w-3.5" /> Alert On
        </>
      ) : (
        <>
          <TrendingDown className="h-3.5 w-3.5" /> Price Alert
        </>
      )}
    </Button>
  );
};

export default PriceDropAlert;
