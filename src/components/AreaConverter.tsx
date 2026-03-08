import { useState } from "react";
import { Ruler } from "lucide-react";

const units = [
  { label: "Sq Ft", factor: 1 },
  { label: "Sq M", factor: 0.0929 },
  { label: "Sq Yd", factor: 0.1111 },
  { label: "Acres", factor: 0.0000229568 },
  { label: "Hectares", factor: 0.00000929 },
  { label: "Gaj", factor: 0.1111 },
  { label: "Marla", factor: 0.003673 },
  { label: "Kanal", factor: 0.000459 },
];

const AreaConverter = () => {
  const [value, setValue] = useState(1000);
  const [fromUnit, setFromUnit] = useState(0);

  const baseSqFt = value / units[fromUnit].factor;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Ruler className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">Area Converter</h3>
      </div>

      <div className="flex gap-2 mb-3">
        <input type="number" value={value} onChange={e => setValue(+e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none" />
        <select value={fromUnit} onChange={e => setFromUnit(+e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none">
          {units.map((u, i) => <option key={u.label} value={i}>{u.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {units.filter((_, i) => i !== fromUnit).map(u => (
          <div key={u.label} className="bg-secondary rounded-lg px-3 py-2">
            <p className="text-[10px] text-muted-foreground">{u.label}</p>
            <p className="text-sm font-bold text-foreground">{(baseSqFt * u.factor).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AreaConverter;
