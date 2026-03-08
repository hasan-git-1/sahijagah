import { useState } from "react";
import { Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReportPropertyModalProps {
  propertyId: string;
  userId: string;
}

const reasons = [
  "Fake listing / Scam",
  "Incorrect price",
  "Already rented / sold",
  "Inappropriate content",
  "Duplicate listing",
  "Other",
];

const ReportPropertyModal = ({ propertyId, userId }: ReportPropertyModalProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) { toast.error("Please select a reason"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("reports").insert({
        property_id: propertyId,
        user_id: userId,
        reason,
        details: details || null,
      });
      if (error) throw error;
      toast.success("Report submitted. We'll review it shortly.");
      setOpen(false);
      setReason("");
      setDetails("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors mt-3">
        <Flag className="h-3.5 w-3.5" /> Report this listing
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setOpen(false)} />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card rounded-t-2xl z-50 p-5 shadow-card max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Flag className="h-4 w-4 text-destructive" /> Report Listing
              </h3>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-2 mb-4">
              {reasons.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                    reason === r ? "bg-destructive/10 text-destructive font-medium border border-destructive/30" : "bg-secondary text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
              placeholder="Additional details (optional)"
              rows={3}
              value={details}
              onChange={e => setDetails(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={loading} className="w-full mt-3 bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default ReportPropertyModal;
