import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from "@/hooks/useProperties";
import { toast } from "sonner";

interface ComparisonPDFExportProps {
  properties: Property[];
}

const formatPrice = (p: number, type: string) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString("en-IN")}${type === "rent" || type === "pg" ? "/mo" : ""}`;
};

const ComparisonPDFExport = ({ properties }: ComparisonPDFExportProps) => {
  const handleExport = () => {
    if (properties.length < 2) {
      toast.error("Add at least 2 properties to export");
      return;
    }

    const fields = [
      { label: "Price", get: (p: Property) => formatPrice(p.price, p.type) },
      { label: "Type", get: (p: Property) => p.type },
      { label: "City", get: (p: Property) => p.city },
      { label: "Address", get: (p: Property) => p.address || "—" },
      { label: "Bedrooms", get: (p: Property) => p.bedrooms?.toString() || "—" },
      { label: "Bathrooms", get: (p: Property) => p.bathrooms?.toString() || "—" },
      { label: "Area", get: (p: Property) => p.area || "—" },
      { label: "Amenities", get: (p: Property) => p.amenities?.join(", ") || "None" },
      { label: "Verified", get: (p: Property) => p.is_verified ? "Yes" : "No" },
    ];

    // Build HTML for print
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Property Comparison - urbanStay</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #333; }
          h1 { color: #2563eb; font-size: 22px; margin-bottom: 4px; }
          .subtitle { color: #888; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: left; font-size: 13px; }
          th { background: #f5f5f5; font-weight: 600; }
          .prop-name { font-weight: 700; color: #2563eb; }
          .footer { margin-top: 24px; text-align: center; color: #aaa; font-size: 11px; }
        </style>
      </head>
      <body>
        <h1>🏠 Property Comparison</h1>
        <p class="subtitle">Generated from urbanStay on ${new Date().toLocaleDateString()}</p>
        <table>
          <tr>
            <th>Feature</th>
            ${properties.map((p) => `<th class="prop-name">${p.title}</th>`).join("")}
          </tr>
          ${fields.map((f) => `
            <tr>
              <td><strong>${f.label}</strong></td>
              ${properties.map((p) => `<td>${f.get(p)}</td>`).join("")}
            </tr>
          `).join("")}
        </table>
        <div class="footer">Powered by urbanStay — urbanstay.in</div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      toast.success("Comparison ready to save as PDF!");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-1.5"
      disabled={properties.length < 2}
    >
      <Download className="h-3.5 w-3.5" /> Export PDF
    </Button>
  );
};

export default ComparisonPDFExport;
