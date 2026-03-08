import { useState } from "react";
import { Shield, Smartphone, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TwoFactorSetup = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<"info" | "phone" | "verify" | "done">("info");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }
    setLoading(true);
    // Simulate OTP send - in production this would use a real SMS service
    setTimeout(() => {
      setLoading(false);
      setStep("verify");
      toast.success("OTP sent to your phone");
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }
    setLoading(true);
    // Simulate verification
    setTimeout(async () => {
      if (user) {
        await supabase.from("profiles").update({ phone }).eq("id", user.id);
      }
      setLoading(false);
      setStep("done");
      toast.success("Two-factor authentication enabled!");
    }, 1500);
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-foreground text-sm">Two-Factor Authentication</h3>
      </div>

      {step === "info" && (
        <div className="space-y-3">
          <div className="bg-primary/5 rounded-xl p-3">
            <p className="text-xs text-foreground leading-relaxed">
              Add an extra layer of security to your account. When enabled, you'll need to verify your identity with a code sent to your phone.
            </p>
          </div>
          <div className="space-y-2">
            {[
              "Protects against unauthorized access",
              "SMS verification on new device login",
              "Secure your property transactions",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-xs text-foreground">
                <Check className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>
          <Button onClick={() => setStep("phone")} className="w-full gradient-blue text-primary-foreground border-0 gap-2">
            <Smartphone className="h-4 w-4" /> Enable 2FA
          </Button>
        </div>
      )}

      {step === "phone" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Enter your phone number to receive verification codes.</p>
          <div className="flex gap-2">
            <span className="flex items-center px-3 bg-secondary rounded-lg text-sm font-medium text-foreground">+91</span>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="Phone number"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setStep("info")} variant="outline" className="flex-1">Back</Button>
            <Button onClick={handleSendOTP} disabled={loading} className="flex-1 gradient-blue text-primary-foreground border-0">
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        </div>
      )}

      {step === "verify" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to +91 {phone}</p>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter OTP"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-center text-lg tracking-[0.5em] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2">
            <Button onClick={() => setStep("phone")} variant="outline" className="flex-1">Back</Button>
            <Button onClick={handleVerifyOTP} disabled={loading} className="flex-1 gradient-blue text-primary-foreground border-0">
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
          <button onClick={handleSendOTP} className="text-xs text-primary font-medium w-full text-center">
            Resend OTP
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="text-center py-4">
          <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <Check className="h-7 w-7 text-accent" />
          </div>
          <h4 className="font-bold text-foreground mb-1">2FA Enabled!</h4>
          <p className="text-xs text-muted-foreground">Your account is now secured with two-factor authentication.</p>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
