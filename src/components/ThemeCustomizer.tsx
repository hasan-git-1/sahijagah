import { useState, useEffect } from "react";
import { Palette, Check } from "lucide-react";

const accentColors = [
  { name: "Blue", hsl: "217 91% 50%", dark: "217 91% 60%" },
  { name: "Emerald", hsl: "160 84% 39%", dark: "160 84% 49%" },
  { name: "Violet", hsl: "263 70% 50%", dark: "263 70% 60%" },
  { name: "Rose", hsl: "347 77% 50%", dark: "347 77% 60%" },
  { name: "Amber", hsl: "38 92% 50%", dark: "38 92% 55%" },
  { name: "Teal", hsl: "173 80% 36%", dark: "173 80% 46%" },
];

const STORAGE_KEY = "urbanstay-accent";

const ThemeCustomizer = () => {
  const [active, setActive] = useState(() => localStorage.getItem(STORAGE_KEY) || "Blue");

  useEffect(() => {
    const color = accentColors.find((c) => c.name === active);
    if (!color) return;
    const root = document.documentElement;
    root.style.setProperty("--primary", color.hsl);
    root.style.setProperty("--ring", color.hsl);
    localStorage.setItem(STORAGE_KEY, active);

    // Update dark mode variant too
    const darkStyle = document.querySelector(".dark") as HTMLElement;
    if (darkStyle) {
      darkStyle.style.setProperty("--primary", color.dark);
      darkStyle.style.setProperty("--ring", color.dark);
    }
  }, [active]);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="h-5 w-5 text-primary" />
        <p className="text-sm font-semibold text-foreground">Accent Color</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {accentColors.map((color) => (
          <button
            key={color.name}
            onClick={() => setActive(color.name)}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center transition-transform ${
                active === color.name ? "scale-110 ring-2 ring-offset-2 ring-offset-card" : ""
              }`}
              style={{ background: `hsl(${color.hsl})` }}
            >
              {active === color.name && <Check className="h-4 w-4 text-primary-foreground" />}
            </div>
            <span className="text-[9px] font-medium text-muted-foreground">{color.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeCustomizer;
