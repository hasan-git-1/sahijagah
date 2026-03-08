import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OTPVerificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  email: string;
  action: string;
}

const OTPVerification = ({ open, onOpenChange, onVerified, email, action }: OTPVerificationProps) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOtp = () => {
    setLoading(true);
    const code = generateOtp();
    setGeneratedOtp(code);
    // In production, this would send via email/SMS
    // For demo, we show it as a toast
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      setCountdown(60);
      toast.info(`Demo OTP: ${code}`, { duration: 15000 });
    }, 1000);
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOtp.every((d) => d) && newOtp.join("") === generatedOtp) {
      toast.success("Verified successfully!");
      onVerified();
      onOpenChange(false);
      setOtp(["", "", "", "", "", ""]);
      setSent(false);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code === generatedOtp) {
      toast.success("Verified successfully!");
      onVerified();
      onOpenChange(false);
      setOtp(["", "", "", "", "", ""]);
      setSent(false);
    } else {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Verify Your Identity
          </DialogTitle>
          <DialogDescription>
            {action} requires OTP verification for security.
          </DialogDescription>
        </DialogHeader>

        {!sent ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We'll send a 6-digit code to <strong className="text-foreground">{email}</strong>
            </p>
            <Button onClick={handleSendOtp} disabled={loading} className="w-full gradient-blue text-primary-foreground border-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send OTP
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Enter the 6-digit code sent to your email
            </p>
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-12 w-10 rounded-lg border border-input bg-secondary text-center text-lg font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              ))}
            </div>
            <Button onClick={handleVerify} className="w-full gradient-blue text-primary-foreground border-0">
              Verify
            </Button>
            <div className="text-center">
              {countdown > 0 ? (
                <span className="text-xs text-muted-foreground">Resend in {countdown}s</span>
              ) : (
                <button onClick={handleSendOtp} className="text-xs text-primary font-medium">
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerification;
