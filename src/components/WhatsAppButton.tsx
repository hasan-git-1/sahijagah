import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  propertyTitle: string;
  propertyPrice: string;
  city: string;
  phone?: string;
}

const WhatsAppButton = ({ propertyTitle, propertyPrice, city, phone }: WhatsAppButtonProps) => {
  const defaultPhone = phone || "919999999999";
  const message = encodeURIComponent(
    `Hi, I'm interested in "${propertyTitle}" listed at ${propertyPrice} in ${city}. Is it still available?`
  );

  const handleClick = () => {
    window.open(`https://wa.me/${defaultPhone}?text=${message}`, "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      className="gap-2 bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-primary-foreground border-0"
      size="sm"
    >
      <MessageCircle className="h-4 w-4" />
      WhatsApp
    </Button>
  );
};

export default WhatsAppButton;
