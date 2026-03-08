import { useState } from "react";
import { Share2, Copy, MessageCircle, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";

interface PropertyShareMenuProps {
  propertyId: string;
  title: string;
  price: string;
  city: string;
}

const PropertyShareMenu = ({ propertyId, title, price, city }: PropertyShareMenuProps) => {
  const [open, setOpen] = useState(false);
  const url = `${window.location.origin}/app/property/${propertyId}`;
  const text = `Check out this property: ${title} - ${price} in ${city}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied!");
    setOpen(false);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`, "_blank");
    setOpen(false);
  };

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({ title, text, url });
    } else {
      copyLink();
    }
    setOpen(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="h-9 w-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
        <Share2 className="h-5 w-5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setOpen(false)} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card rounded-t-2xl z-50 p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Share Property</h3>
          <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={shareWhatsApp} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-foreground">WhatsApp</span>
          </button>
          <button onClick={copyLink} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Copy className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground">Copy Link</span>
          </button>
          <button onClick={shareNative} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
              <ExternalLink className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground">More</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default PropertyShareMenu;
