import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

interface ParsedProperty {
  title: string;
  type: string;
  price: number;
  city: string;
  description?: string;
  category?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  amenities?: string[];
}

const BulkUploadModal = ({ open, onOpenChange, userId }: BulkUploadModalProps) => {
  const [parsed, setParsed] = useState<ParsedProperty[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) { setErrors(["CSV must have a header row and at least one data row"]); return; }

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const required = ["title", "type", "price", "city"];
    const missing = required.filter(r => !headers.includes(r));
    if (missing.length) { setErrors([`Missing required columns: ${missing.join(", ")}`]); return; }

    const props: ParsedProperty[] = [];
    const errs: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, j) => { row[h] = values[j] || ""; });

      if (!row.title || !row.type || !row.price || !row.city) {
        errs.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      const price = Number(row.price);
      if (isNaN(price) || price <= 0) {
        errs.push(`Row ${i + 1}: Invalid price "${row.price}"`);
        continue;
      }

      props.push({
        title: row.title,
        type: row.type,
        price,
        city: row.city,
        description: row.description || undefined,
        category: row.category || undefined,
        address: row.address || undefined,
        bedrooms: row.bedrooms ? Number(row.bedrooms) : undefined,
        bathrooms: row.bathrooms ? Number(row.bathrooms) : undefined,
        area: row.area || undefined,
        amenities: row.amenities ? row.amenities.split(";").map(a => a.trim()) : undefined,
      });
    }

    setParsed(props);
    setErrors(errs);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => parseCSV(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!parsed.length) return;
    setLoading(true);
    try {
      const rows = parsed.map(p => ({
        title: p.title,
        type: p.type,
        price: p.price,
        city: p.city,
        description: p.description || null,
        category: p.category || null,
        address: p.address || null,
        bedrooms: p.bedrooms || 0,
        bathrooms: p.bathrooms || 0,
        area: p.area || null,
        amenities: p.amenities || [],
        images: [],
        owner_id: userId,
        status: "pending",
      }));

      const { error } = await supabase.from("properties").insert(rows);
      if (error) throw error;
      setUploaded(true);
      toast.success(`${rows.length} properties uploaded!`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={() => onOpenChange(false)} />
      <div className="fixed inset-x-4 top-12 bottom-12 z-50 bg-card rounded-2xl shadow-card overflow-y-auto max-w-md mx-auto">
        <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Bulk Upload Properties</h3>
          <button onClick={() => { onOpenChange(false); setParsed([]); setErrors([]); setUploaded(false); }} className="text-muted-foreground text-sm">Close</button>
        </div>
        <div className="p-4 space-y-4">
          {uploaded ? (
            <div className="text-center py-8">
              <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <Check className="h-7 w-7 text-accent" />
              </div>
              <h4 className="font-bold text-foreground">Upload Complete!</h4>
              <p className="text-sm text-muted-foreground mt-1">{parsed.length} properties submitted for review</p>
              <Button onClick={() => onOpenChange(false)} className="mt-4 gradient-blue text-primary-foreground border-0">Done</Button>
            </div>
          ) : (
            <>
              <div className="bg-secondary rounded-xl p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">CSV Format</h4>
                <p className="text-xs text-muted-foreground mb-2">Required columns: <span className="font-medium text-foreground">title, type, price, city</span></p>
                <p className="text-xs text-muted-foreground">Optional: description, category, address, bedrooms, bathrooms, area, amenities (semicolon-separated)</p>
                <div className="mt-2 bg-background rounded-lg p-2 text-[10px] font-mono text-muted-foreground overflow-x-auto">
                  title,type,price,city,bedrooms,bathrooms<br/>
                  2BHK Apartment,rent,25000,Hyderabad,2,2<br/>
                  3BHK Villa,sale,8500000,Pune,3,3
                </div>
              </div>

              <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
              <Button onClick={() => fileRef.current?.click()} variant="outline" className="w-full gap-2">
                <Upload className="h-4 w-4" /> Select CSV File
              </Button>

              {errors.length > 0 && (
                <div className="bg-destructive/10 rounded-lg p-3 space-y-1">
                  {errors.map((e, i) => (
                    <p key={i} className="text-xs text-destructive flex items-start gap-1">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" /> {e}
                    </p>
                  ))}
                </div>
              )}

              {parsed.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{parsed.length} properties ready</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {parsed.map((p, i) => (
                      <div key={i} className="bg-secondary rounded-lg p-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{p.title}</p>
                          <p className="text-[10px] text-muted-foreground">{p.city} · ₹{p.price.toLocaleString("en-IN")} · {p.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleUpload} disabled={loading} className="w-full gradient-blue text-primary-foreground border-0">
                    {loading ? "Uploading..." : `Upload ${parsed.length} Properties`}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BulkUploadModal;
