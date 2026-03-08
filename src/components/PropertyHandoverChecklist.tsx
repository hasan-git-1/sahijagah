import { useState, useEffect } from "react";
import { ClipboardList, Check, Circle } from "lucide-react";

const defaultItems = [
  { id: 1, label: "Walls & paint condition documented", category: "Structure" },
  { id: 2, label: "All switches & sockets working", category: "Electrical" },
  { id: 3, label: "Water supply & drainage checked", category: "Plumbing" },
  { id: 4, label: "All keys collected/handed over", category: "General" },
  { id: 5, label: "Meter readings noted (electricity)", category: "Utilities" },
  { id: 6, label: "Meter readings noted (water)", category: "Utilities" },
  { id: 7, label: "Appliances tested (geyser, AC, etc.)", category: "Appliances" },
  { id: 8, label: "Doors & locks functioning properly", category: "Structure" },
  { id: 9, label: "Windows & glass intact", category: "Structure" },
  { id: 10, label: "Photos taken of current condition", category: "Documentation" },
  { id: 11, label: "Security deposit receipt collected", category: "Documentation" },
  { id: 12, label: "Gas connection transfer done", category: "Utilities" },
];

const PropertyHandoverChecklist = () => {
  const STORAGE_KEY = "handover-checklist";
  const [checked, setChecked] = useState<number[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)), [checked]);

  const toggle = (id: number) => {
    setChecked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const progress = Math.round((checked.length / defaultItems.length) * 100);
  const categories = [...new Set(defaultItems.map(i => i.category))];

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <ClipboardList className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground">Handover Checklist</h3>
          <p className="text-[10px] text-muted-foreground">{checked.length}/{defaultItems.length} completed</p>
        </div>
        <span className="text-sm font-bold text-primary">{progress}%</span>
      </div>

      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">{cat}</p>
            <div className="space-y-1">
              {defaultItems.filter(i => i.category === cat).map(item => (
                <button key={item.id} onClick={() => toggle(item.id)}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-left">
                  {checked.includes(item.id) ? (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`text-xs ${checked.includes(item.id) ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyHandoverChecklist;
