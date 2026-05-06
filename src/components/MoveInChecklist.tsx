import { useState, useEffect } from "react";
import { CheckSquare, Square, ClipboardList } from "lucide-react";

const defaultItems = [
  { id: "1", label: "Verify rental agreement signed", category: "Documents" },
  { id: "2", label: "Collect all keys & access cards", category: "Documents" },
  { id: "3", label: "Take photos of property condition", category: "Inspection" },
  { id: "4", label: "Check all switches & fixtures", category: "Inspection" },
  { id: "5", label: "Test water supply & drainage", category: "Inspection" },
  { id: "6", label: "Set up electricity connection", category: "Utilities" },
  { id: "7", label: "Set up internet / WiFi", category: "Utilities" },
  { id: "8", label: "Update address for deliveries", category: "Admin" },
  { id: "9", label: "Meet neighbors & security", category: "Admin" },
  { id: "10", label: "Note emergency contacts", category: "Admin" },
];

const STORAGE_KEY = "urbanstay-movein-checklist";

const MoveInChecklist = () => {
  const [checked, setChecked] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggle = (id: string) => {
    setChecked((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const progress = Math.round((checked.length / defaultItems.length) * 100);
  const categories = [...new Set(defaultItems.map((i) => i.category))];

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Move-in Checklist
        </h3>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
          {progress}%
        </span>
      </div>

      <div className="h-1.5 bg-secondary rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{cat}</p>
            <div className="space-y-1">
              {defaultItems
                .filter((item) => item.category === cat)
                .map((item) => {
                  const done = checked.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
                        done ? "bg-accent/10" : "hover:bg-secondary/50"
                      }`}
                    >
                      {done ? (
                        <CheckSquare className="h-4 w-4 text-accent flex-shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={`text-sm ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoveInChecklist;
