import { ArrowLeft, FileCheck, Upload, Shield, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface DocVerification {
  id: string;
  name: string;
  type: string;
  status: "pending" | "verified" | "flagged";
  uploadedAt: string;
  notes?: string;
}

const DocumentVerificationScreen = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocVerification[]>([
    { id: "1", name: "Sale Agreement - Flat 302", type: "Sale Deed", status: "verified", uploadedAt: "2026-02-20", notes: "All stamps and signatures verified." },
    { id: "2", name: "Encumbrance Certificate", type: "EC", status: "pending", uploadedAt: "2026-03-05" },
  ]);

  const docTypes = ["Sale Deed", "Title Deed", "EC", "NOC", "Khata", "Tax Receipt", "Building Plan", "Occupancy Certificate", "Other"];

  const handleUpload = () => {
    const newDoc: DocVerification = {
      id: Date.now().toString(),
      name: `Document_${Date.now().toString().slice(-4)}`,
      type: "Other",
      status: "pending",
      uploadedAt: new Date().toISOString().split("T")[0],
    };
    setDocs([newDoc, ...docs]);
    toast.success("Document uploaded! AI verification will complete in 24-48 hours.");
  };

  const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    verified: { icon: CheckCircle, color: "text-accent bg-accent/10", label: "Verified" },
    pending: { icon: Clock, color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Pending" },
    flagged: { icon: AlertTriangle, color: "text-destructive bg-destructive/10", label: "Flagged" },
  };

  const checklist = [
    { label: "Title deed authenticity", done: true },
    { label: "Encumbrance check (15 years)", done: true },
    { label: "Property tax clearance", done: false },
    { label: "RERA registration verified", done: true },
    { label: "Building approval plan match", done: false },
    { label: "No pending litigation", done: true },
    { label: "Seller identity verified", done: false },
    { label: "NOC from society/association", done: false },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Document Verification</h2>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <Button onClick={handleUpload} className="w-full gradient-blue text-primary-foreground border-0 gap-2">
          <Upload className="h-4 w-4" /> Upload Document for Verification
        </Button>

        {/* AI Verification Checklist */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2 mb-3">
            <FileCheck className="h-4 w-4 text-primary" /> AI Verification Checklist
          </h3>
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-accent/20" : "bg-secondary"}`}>
                  {item.done ? <CheckCircle className="h-3.5 w-3.5 text-accent" /> : <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                </div>
                <span className={`text-xs ${item.done ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            {checklist.filter((c) => c.done).length}/{checklist.length} checks completed
          </p>
        </div>

        {/* Document List */}
        <h3 className="font-bold text-foreground text-sm">Uploaded Documents</h3>
        {docs.map((doc) => {
          const cfg = statusConfig[doc.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={doc.id} className="bg-card rounded-2xl p-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{doc.name}</p>
                  <p className="text-[10px] text-muted-foreground">{doc.type} · {doc.uploadedAt}</p>
                  {doc.notes && <p className="text-xs text-muted-foreground mt-1">{doc.notes}</p>}
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${cfg.color}`}>
                  <StatusIcon className="h-3 w-3" /> {cfg.label}
                </span>
              </div>
            </div>
          );
        })}

        {/* Info */}
        <div className="bg-primary/5 rounded-2xl p-4">
          <p className="text-xs text-foreground font-semibold mb-1">🤖 How AI Verification Works</p>
          <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
            <li>Upload property documents (PDF, images)</li>
            <li>AI scans for authenticity markers and stamps</li>
            <li>Cross-references with government databases</li>
            <li>Flags discrepancies for manual review</li>
            <li>Generates verification report within 48 hours</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationScreen;
