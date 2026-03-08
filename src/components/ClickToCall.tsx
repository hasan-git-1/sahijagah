import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ClickToCallProps {
  phoneNumber?: string;
  propertyId: string;
  propertyTitle: string;
  onCallTracked?: () => void;
}

const ClickToCall = ({ phoneNumber, propertyId, propertyTitle, onCallTracked }: ClickToCallProps) => {
  const handleCall = () => {
    // Track call attempt in localStorage for analytics
    const callLog = JSON.parse(localStorage.getItem("call_log") || "[]");
    callLog.push({
      propertyId,
      propertyTitle,
      timestamp: new Date().toISOString(),
      phoneNumber: phoneNumber ? "***" + phoneNumber.slice(-4) : "unknown",
    });
    localStorage.setItem("call_log", JSON.stringify(callLog.slice(-50)));

    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, "_self");
      toast.success("Connecting call...");
    } else {
      toast.info("Phone number not available. Try messaging instead.");
    }

    onCallTracked?.();
  };

  return (
    <Button variant="outline" className="flex-1 gap-2" onClick={handleCall}>
      <Phone className="h-4 w-4" /> Call
    </Button>
  );
};

export default ClickToCall;
