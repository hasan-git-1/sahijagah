import { useState } from "react";
import { ArrowLeft, Upload, ShieldCheck, Clock, CheckCircle2, XCircle, FileText, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type VerifyStatus = "not_submitted" | "pending" | "verified" | "rejected";

const TenantVerificationScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile-verify", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  // Check if KYC docs exist in storage
  const { data: kycDocs } = useQuery({
    queryKey: ["kyc-docs", user?.id],
    queryFn: async () => {
      const { data } = await supabase.storage
        .from("document-vault")
        .list(`${user!.id}/ids`, { limit: 10 });
      return (data || []).filter((f) => f.name !== ".emptyFolderPlaceholder");
    },
    enabled: !!user,
  });

  const verifyStatus: VerifyStatus = profile?.is_verified
    ? "verified"
    : (kycDocs && kycDocs.length > 0)
    ? "pending"
    : "not_submitted";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }

    setUploading(true);
    const path = `${user.id}/ids/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("document-vault").upload(path, file);
    setUploading(false);

    if (error) {
      toast.error("Upload failed");
      return;
    }

    toast.success("Document uploaded! Verification in progress.");
    queryClient.invalidateQueries({ queryKey: ["kyc-docs", user.id] });
    e.target.value = "";
  };

  const handleView = async (name: string) => {
    if (!user) return;
    const { data } = await supabase.storage
      .from("document-vault")
      .createSignedUrl(`${user.id}/ids/${name}`, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  if (!user) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <ShieldCheck className="h-12 w-12 text-primary mb-4" />
        <h3 className="font-bold text-foreground mb-2">Tenant Verification</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center">Sign in to verify your identity.</p>
        <Button onClick={() => navigate("/auth")} className="gradient-blue text-primary-foreground border-0">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Verification
        </h2>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Status Card */}
        <div className={`rounded-2xl p-5 shadow-card ${
          verifyStatus === "verified" ? "bg-accent/10" :
          verifyStatus === "pending" ? "bg-primary/10" :
          verifyStatus === "rejected" ? "bg-destructive/10" : "bg-card"
        }`}>
          <div className="flex items-center gap-3 mb-2">
            {verifyStatus === "verified" && <CheckCircle2 className="h-8 w-8 text-accent" />}
            {verifyStatus === "pending" && <Clock className="h-8 w-8 text-primary" />}
            {verifyStatus === "rejected" && <XCircle className="h-8 w-8 text-destructive" />}
            {verifyStatus === "not_submitted" && <ShieldCheck className="h-8 w-8 text-muted-foreground" />}
            <div>
              <h3 className="font-bold text-foreground">
                {verifyStatus === "verified" && "Verified ✅"}
                {verifyStatus === "pending" && "Under Review"}
                {verifyStatus === "rejected" && "Verification Failed"}
                {verifyStatus === "not_submitted" && "Not Verified"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {verifyStatus === "verified" && "Your identity has been confirmed."}
                {verifyStatus === "pending" && "We're reviewing your documents. This usually takes 24-48 hours."}
                {verifyStatus === "rejected" && "Please re-upload clear documents."}
                {verifyStatus === "not_submitted" && "Upload your ID to get verified and build trust with owners."}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h4 className="text-sm font-bold text-foreground mb-3">Why verify?</h4>
          <div className="space-y-2">
            {[
              "✅ Trusted badge on your profile",
              "🏠 Higher response rate from owners",
              "🔒 Secure identity verification",
              "⚡ Faster booking approvals",
            ].map((benefit) => (
              <p key={benefit} className="text-xs text-muted-foreground">{benefit}</p>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        {verifyStatus !== "verified" && (
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h4 className="text-sm font-bold text-foreground mb-2">Upload ID Document</h4>
            <p className="text-[10px] text-muted-foreground mb-3">
              Aadhaar Card, PAN Card, Passport, or Driving License
            </p>
            <label>
              <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png" />
              <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary font-semibold text-sm cursor-pointer hover:bg-primary/10 transition-colors">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Choose File"}
              </div>
            </label>
          </div>
        )}

        {/* Uploaded docs */}
        {kycDocs && kycDocs.length > 0 && (
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h4 className="text-sm font-bold text-foreground mb-3">Submitted Documents</h4>
            <div className="space-y-2">
              {kycDocs.map((doc) => (
                <div key={doc.name} className="flex items-center gap-3 bg-secondary/50 rounded-xl px-3 py-2.5">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-xs text-foreground flex-1 truncate">
                    {doc.name.split("_").slice(1).join("_") || doc.name}
                  </span>
                  <button onClick={() => handleView(doc.name)} className="h-7 w-7 rounded-full bg-card flex items-center justify-center">
                    <Eye className="h-3.5 w-3.5 text-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantVerificationScreen;
