import { useState } from "react";
import { Phone, Send, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  propertyTitle: string;
}

const QuickContactForm = ({ propertyTitle }: Props) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(`Hi, I'm interested in "${propertyTitle}". Please share more details.`);
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter name and phone");
      return;
    }
    if (phone.length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }
    toast.success("Inquiry sent! Owner will contact you soon.");
    setSent(true);
  };

  if (sent) {
    return (
      <div className="bg-primary/5 rounded-2xl p-4 text-center">
        <p className="text-sm font-bold text-primary">✅ Inquiry Sent!</p>
        <p className="text-xs text-muted-foreground mt-1">The owner will reach out to you shortly</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircle className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">Quick Inquiry</h3>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none" />
        </div>
        <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          <input placeholder="Phone number" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none" />
        </div>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none resize-none h-16" />
        <Button onClick={handleSubmit} className="w-full gap-2" size="sm">
          <Send className="h-4 w-4" /> Send Inquiry
        </Button>
      </div>
    </div>
  );
};

export default QuickContactForm;
