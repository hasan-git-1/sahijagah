import { Share2, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface PropertyShareCardProps {
  title: string;
  price: string;
  city: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  image?: string;
  type?: string;
  propertyId: string;
}

const PropertyShareCard = ({ title, price, city, bedrooms, bathrooms, area, image, type, propertyId }: PropertyShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const typeLabel: Record<string, string> = { rent: "For Rent", sale: "For Sale", pg: "PG", commercial: "Commercial" };

  const shareUrl = `${window.location.origin}/app/property/${propertyId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  };

  const handleNativeShare = async () => {
    const text = `🏠 ${title}\n💰 ${price}\n📍 ${city}\n${bedrooms ? `🛏 ${bedrooms} BHK` : ""}\n\n👉 ${shareUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Property details copied!");
    }
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 600, 400);
      gradient.addColorStop(0, "#1a1a2e");
      gradient.addColorStop(1, "#16213e");
      ctx.fillStyle = gradient;
      ctx.roundRect(0, 0, 600, 400, 16);
      ctx.fill();

      // Property image placeholder
      ctx.fillStyle = "#0f3460";
      ctx.roundRect(24, 24, 240, 180, 12);
      ctx.fill();
      ctx.fillStyle = "#e94560";
      ctx.font = "bold 14px system-ui";
      ctx.fillText(typeLabel[type || "rent"] || "Property", 40, 56);

      // Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px system-ui";
      ctx.fillText(title.slice(0, 30), 280, 60);
      ctx.fillStyle = "#e94560";
      ctx.font = "bold 28px system-ui";
      ctx.fillText(price, 280, 100);
      ctx.fillStyle = "#a0a0b0";
      ctx.font = "16px system-ui";
      ctx.fillText(`📍 ${city}`, 280, 135);
      if (bedrooms) ctx.fillText(`🛏 ${bedrooms} BHK`, 280, 165);
      if (area) ctx.fillText(`📐 ${area}`, 280, 195);

      // Brand
      ctx.fillStyle = "#e94560";
      ctx.font = "bold 18px system-ui";
      ctx.fillText("urbanStay", 24, 370);
      ctx.fillStyle = "#666";
      ctx.font = "12px system-ui";
      ctx.fillText("urbanstay.com", 24, 390);

      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "-")}-urbanstay.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Property card downloaded!");
    } catch {
      toast.error("Could not generate card");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" /> Share Card
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Share Property Card</DialogTitle>
        </DialogHeader>

        {/* Preview Card */}
        <div ref={cardRef} className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.7)] rounded-2xl p-5 text-primary-foreground">
          <div className="flex gap-3">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-primary-foreground/10 flex-shrink-0">
              {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold bg-primary-foreground/20 px-2 py-0.5 rounded-full">
                {typeLabel[type || "rent"] || "Property"}
              </span>
              <p className="font-bold text-sm mt-1 truncate">{title}</p>
              <p className="text-lg font-extrabold mt-0.5">{price}</p>
              <p className="text-xs opacity-80">📍 {city}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-3 text-xs opacity-90">
            {bedrooms ? <span>🛏 {bedrooms} BHK</span> : null}
            {bathrooms ? <span>🚿 {bathrooms} Bath</span> : null}
            {area ? <span>📐 {area}</span> : null}
          </div>
          <div className="mt-3 pt-2 border-t border-primary-foreground/20 flex items-center justify-between">
            <span className="text-xs font-bold">urbanStay</span>
            <span className="text-[10px] opacity-60">Find your perfect home</span>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button onClick={handleNativeShare} className="flex-1 gap-2"><Share2 className="h-4 w-4" /> Share</Button>
          <Button onClick={handleCopyLink} variant="outline" className="flex-1 gap-2"><Copy className="h-4 w-4" /> Copy Link</Button>
          <Button onClick={handleDownloadCard} variant="secondary" className="gap-2"><Download className="h-4 w-4" /></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyShareCard;
