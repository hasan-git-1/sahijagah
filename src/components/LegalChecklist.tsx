import { useState, useEffect } from "react";
import { Scale, Check, Circle, AlertTriangle } from "lucide-react";

const buyChecklist = [
  { id: 1, label: "Title deed verification", critical: true },
  { id: 2, label: "Encumbrance certificate (last 30 years)", critical: true },
  { id: 3, label: "Approved building plan from authority", critical: true },
  { id: 4, label: "Property tax receipts up to date", critical: false },
  { id: 5, label: "No-objection certificate (NOC) from society", critical: false },
  { id: 6, label: "Occupancy certificate (OC)", critical: true },
  { id: 7, label: "Completion certificate (CC)", critical: true },
  { id: 8, label: "RERA registration check", critical: true },
  { id: 9, label: "Khata certificate (Karnataka) / Patta (TN)", critical: false },
  { id: 10, label: "Power of Attorney verification", critical: false },
  { id: 11, label: "Verify seller identity & ownership", critical: true },
  { id: 12, label: "Check for any pending litigation", critical: true },
];

const rentChecklist = [
  { id: 101, label: "Rent agreement drafted & registered", critical: true },
  { id: 102, label: "Landlord identity verified", critical: true },
  { id: 103, label: "Security deposit receipt obtained", critical: true },
  { id: 104, label: "Property condition documented", critical: false },
  { id: 105, label: "Maintenance charges clarified", critical: false },
  { id: 106, label: "Lock-in period terms agreed", critical: false },
  { id: 107, label: "Notice period terms agreed", critical: false },
  { id: 108, label: "Police verification completed", critical: true },
];

const LegalChecklist = ({ type = "sale" }: { type?: string }) => {
  const items = type === "rent" || type === "pg" ? rentChecklist : buyChecklist;
  const STORAGE_KEY = `legal-checklist-${type}`;
  const [checked, setChecked] = useState<number[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)), [checked]);

  const toggle = (id: number) => {
    setChecked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const progress = Math.round((checked.length / items.length) * 100);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Scale className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground">Legal Checklist</h3>
          <p className="text-[10px] text-muted-foreground">For {type === "rent" || type === "pg" ? "rental" : "purchase"} verification</p>
        </div>
        <span className="text-sm font-bold text-primary">{progress}%</span>
      </div>

      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-1">
        {items.map(item => (
          <button key={item.id} onClick={() => toggle(item.id)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-left">
            {checked.includes(item.id) ? (
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={`text-xs flex-1 ${checked.includes(item.id) ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {item.label}
            </span>
            {item.critical && !checked.includes(item.id) && (
              <AlertTriangle className="h-3 w-3 text-yellow-500 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LegalChecklist;
