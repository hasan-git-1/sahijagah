import { useState } from "react";
import { FileText, Download, Calendar, User, Home, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface RentAgreementProps {
  propertyTitle?: string;
  propertyAddress?: string;
  ownerName?: string;
  rent?: number;
}

const RentAgreementGenerator = ({ propertyTitle, propertyAddress, ownerName, rent }: RentAgreementProps) => {
  const [form, setForm] = useState({
    tenantName: "",
    ownerName: ownerName || "",
    propertyAddress: propertyAddress || "",
    monthlyRent: rent?.toString() || "",
    securityDeposit: "",
    startDate: "",
    duration: "11",
    city: "",
  });
  const [generated, setGenerated] = useState("");

  const handleChange = (key: string, value: string) => setForm({ ...form, [key]: value });

  const generateAgreement = () => {
    if (!form.tenantName || !form.ownerName || !form.monthlyRent || !form.startDate) {
      toast.error("Please fill all required fields");
      return;
    }

    const endDate = new Date(form.startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(form.duration));

    const agreement = `
RENT AGREEMENT

This Rent Agreement is executed on ${new Date(form.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} at ${form.city || "___________"}.

BETWEEN

LANDLORD: ${form.ownerName} (hereinafter referred to as "Owner/Landlord")

AND

TENANT: ${form.tenantName} (hereinafter referred to as "Tenant")

PROPERTY DETAILS:
Address: ${form.propertyAddress || "___________"}
${propertyTitle ? `Property: ${propertyTitle}` : ""}

TERMS AND CONDITIONS:

1. PERIOD OF TENANCY:
   This agreement shall be for a period of ${form.duration} months commencing from ${new Date(form.startDate).toLocaleDateString("en-IN")} to ${endDate.toLocaleDateString("en-IN")}.

2. RENT:
   The monthly rent for the premises shall be ₹${parseInt(form.monthlyRent).toLocaleString("en-IN")} (Rupees ${numberToWords(parseInt(form.monthlyRent))} only), payable on or before the 5th day of every month.

3. SECURITY DEPOSIT:
   The Tenant has deposited a sum of ₹${form.securityDeposit ? parseInt(form.securityDeposit).toLocaleString("en-IN") : "___________"} as security deposit, which shall be refunded at the time of vacating the premises, after deducting any dues or damages.

4. MAINTENANCE:
   The Tenant shall maintain the premises in good condition and shall not make any structural changes without prior written consent of the Owner.

5. UTILITIES:
   All utility charges including electricity, water, gas, and internet shall be borne by the Tenant.

6. TERMINATION:
   Either party may terminate this agreement by giving one month's notice in writing.

7. GOVERNING LAW:
   This agreement shall be governed by the laws of India and the courts at ${form.city || "___________"} shall have jurisdiction.

IN WITNESS WHEREOF, the parties have signed this agreement on the date mentioned above.


_______________________          _______________________
Landlord Signature               Tenant Signature
(${form.ownerName})              (${form.tenantName})


Witness 1: _______________________

Witness 2: _______________________
`.trim();

    setGenerated(agreement);
    toast.success("Agreement generated!");
  };

  const downloadAgreement = () => {
    const blob = new Blob([generated], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rent_Agreement_${form.tenantName.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Agreement downloaded!");
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-foreground">Rent Agreement</h3>
      </div>

      {!generated ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Tenant Name *</Label>
              <Input placeholder="Tenant name" value={form.tenantName} onChange={(e) => handleChange("tenantName", e.target.value)} className="text-sm" />
            </div>
            <div>
              <Label className="text-xs">Owner Name *</Label>
              <Input placeholder="Owner name" value={form.ownerName} onChange={(e) => handleChange("ownerName", e.target.value)} className="text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Property Address</Label>
            <Input placeholder="Full address" value={form.propertyAddress} onChange={(e) => handleChange("propertyAddress", e.target.value)} className="text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Monthly Rent (₹) *</Label>
              <Input type="number" placeholder="15000" value={form.monthlyRent} onChange={(e) => handleChange("monthlyRent", e.target.value)} className="text-sm" />
            </div>
            <div>
              <Label className="text-xs">Security Deposit (₹)</Label>
              <Input type="number" placeholder="50000" value={form.securityDeposit} onChange={(e) => handleChange("securityDeposit", e.target.value)} className="text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Start Date *</Label>
              <Input type="date" value={form.startDate} onChange={(e) => handleChange("startDate", e.target.value)} className="text-sm" />
            </div>
            <div>
              <Label className="text-xs">Duration (months)</Label>
              <Input type="number" value={form.duration} onChange={(e) => handleChange("duration", e.target.value)} className="text-sm" />
            </div>
            <div>
              <Label className="text-xs">City</Label>
              <Input placeholder="City" value={form.city} onChange={(e) => handleChange("city", e.target.value)} className="text-sm" />
            </div>
          </div>
          <Button onClick={generateAgreement} className="w-full gradient-blue text-primary-foreground border-0 gap-2">
            <FileText className="h-4 w-4" /> Generate Agreement
          </Button>
        </div>
      ) : (
        <div>
          <pre className="bg-secondary rounded-xl p-3 text-xs text-foreground whitespace-pre-wrap max-h-60 overflow-y-auto font-sans">
            {generated}
          </pre>
          <div className="flex gap-2 mt-3">
            <Button onClick={downloadAgreement} className="flex-1 gradient-cta text-accent-foreground border-0 gap-2">
              <Download className="h-4 w-4" /> Download
            </Button>
            <Button onClick={() => setGenerated("")} variant="outline" className="flex-1">
              Edit Details
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

function numberToWords(n: number): string {
  if (n === 0) return "zero";
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  if (n < 1000) return ones[Math.floor(n / 100)] + " hundred" + (n % 100 ? " and " + numberToWords(n % 100) : "");
  if (n < 100000) return numberToWords(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? " " + numberToWords(n % 1000) : "");
  if (n < 10000000) return numberToWords(Math.floor(n / 100000)) + " lakh" + (n % 100000 ? " " + numberToWords(n % 100000) : "");
  return numberToWords(Math.floor(n / 10000000)) + " crore" + (n % 10000000 ? " " + numberToWords(n % 10000000) : "");
}

export default RentAgreementGenerator;
