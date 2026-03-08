import { ArrowLeft, FileSignature, Calendar, Clock, AlertCircle, CheckCircle, Plus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface Lease {
  id: string;
  propertyName: string;
  tenant: string;
  startDate: string;
  endDate: string;
  rent: number;
  status: "active" | "expiring" | "expired" | "draft";
  signed: boolean;
}

const LeaseManagementScreen = () => {
  const navigate = useNavigate();
  const [leases] = useState<Lease[]>([
    { id: "1", propertyName: "2BHK Banjara Hills", tenant: "Rahul Sharma", startDate: "2025-06-01", endDate: "2026-05-31", rent: 25000, status: "active", signed: true },
    { id: "2", propertyName: "3BHK Koramangala", tenant: "Priya Reddy", startDate: "2025-09-01", endDate: "2026-08-31", rent: 35000, status: "expiring", signed: true },
    { id: "3", propertyName: "1BHK Hinjewadi", tenant: "Pending", startDate: "", endDate: "", rent: 15000, status: "draft", signed: false },
  ]);
  const [showNew, setShowNew] = useState(false);

  const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    active: { color: "bg-accent/10 text-accent", icon: CheckCircle },
    expiring: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: AlertCircle },
    expired: { color: "bg-destructive/10 text-destructive", icon: Clock },
    draft: { color: "bg-secondary text-muted-foreground", icon: FileSignature },
  };

  const formatPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  const handleCreateLease = () => {
    toast.success("Lease draft created! Share with tenant for e-signature.");
    setShowNew(false);
  };

  const handleSign = (id: string) => {
    toast.success("E-signature request sent to tenant!");
  };

  const handleDownload = (id: string) => {
    toast.success("Lease agreement PDF downloaded!");
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">Lease Management</h2>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <Button onClick={() => setShowNew(!showNew)} className="w-full gradient-blue text-primary-foreground border-0 gap-2">
          <Plus className="h-4 w-4" /> Create New Lease
        </Button>

        {showNew && (
          <div className="bg-card rounded-2xl p-4 shadow-card space-y-3">
            <input placeholder="Property name" className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            <input placeholder="Tenant name / email" className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground outline-none" />
              <input type="date" className="bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground outline-none" />
            </div>
            <input placeholder="Monthly rent (₹)" type="number" className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            <div className="flex gap-2">
              <Button onClick={handleCreateLease} className="flex-1 gap-2"><FileSignature className="h-4 w-4" /> Create & Send for Signing</Button>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Active", count: leases.filter((l) => l.status === "active").length, color: "text-accent" },
            { label: "Expiring", count: leases.filter((l) => l.status === "expiring").length, color: "text-yellow-600" },
            { label: "Drafts", count: leases.filter((l) => l.status === "draft").length, color: "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl p-3 text-center shadow-card">
              <p className={`text-xl font-extrabold ${s.color}`}>{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Lease Cards */}
        {leases.map((lease) => {
          const cfg = statusConfig[lease.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={lease.id} className="bg-card rounded-2xl p-4 shadow-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-foreground text-sm">{lease.propertyName}</p>
                  <p className="text-[10px] text-muted-foreground">Tenant: {lease.tenant}</p>
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${cfg.color}`}>
                  <StatusIcon className="h-3 w-3" /> {lease.status}
                </span>
              </div>

              {lease.startDate && (
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {lease.startDate}</span>
                  <span>→</span>
                  <span>{lease.endDate}</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <p className="text-primary font-extrabold">{formatPrice(lease.rent)}<span className="text-[10px] text-muted-foreground font-normal">/mo</span></p>
                <div className="flex gap-2">
                  {!lease.signed && (
                    <Button size="sm" variant="outline" onClick={() => handleSign(lease.id)} className="text-xs gap-1">
                      <FileSignature className="h-3 w-3" /> Sign
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleDownload(lease.id)} className="text-xs gap-1">
                    <Download className="h-3 w-3" /> PDF
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaseManagementScreen;
