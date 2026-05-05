import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

const QUICK_REPLIES = [
  "Is this property still available?",
  "What is the monthly rent?",
  "Can I schedule a visit?",
  "Are pets allowed?",
  "What's included in the rent?",
  "Is there parking available?",
];

const OwnerChatbot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Hi! I'm the property assistant. I can answer common questions about your listings. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Fetch owner's properties for context
  const { data: properties } = useQuery({
    queryKey: ["owner-props-chatbot", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("title, price, type, city, bedrooms, bathrooms, amenities, status, area")
        .eq("owner_id", user!.id)
        .eq("status", "active")
        .limit(10);
      return data || [];
    },
    enabled: !!user && open,
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateResponse = (question: string): string => {
    const q = question.toLowerCase();
    const propCount = properties?.length || 0;

    if (q.includes("available") || q.includes("still")) {
      return `You currently have ${propCount} active listing${propCount !== 1 ? "s" : ""}. All active listings are available for inquiry.`;
    }
    if (q.includes("rent") || q.includes("price") || q.includes("cost")) {
      if (properties?.length) {
        const prices = properties.map((p) => `${p.title}: ₹${Number(p.price).toLocaleString("en-IN")}${p.type === "rent" ? "/mo" : ""}`);
        return `Here are your listing prices:\n${prices.join("\n")}`;
      }
      return "You don't have any active listings yet. Post a property to get started!";
    }
    if (q.includes("visit") || q.includes("schedule") || q.includes("tour")) {
      return "Tenants can book visits directly from your listing page. You'll get a notification and can confirm/decline from your Owner Dashboard.";
    }
    if (q.includes("pet")) {
      return "Pet policies are set per listing. You can update this in your property amenities under the Edit option.";
    }
    if (q.includes("parking")) {
      const withParking = properties?.filter((p) => p.amenities?.includes("Parking"));
      return withParking?.length
        ? `${withParking.length} of your listings include parking: ${withParking.map((p) => p.title).join(", ")}`
        : "None of your current listings mention parking. You can add it via Edit → Amenities.";
    }
    if (q.includes("included") || q.includes("amenities")) {
      if (properties?.length) {
        const amenityList = properties.map((p) => `${p.title}: ${p.amenities?.join(", ") || "None listed"}`);
        return `Amenities per listing:\n${amenityList.join("\n")}`;
      }
      return "No active listings found.";
    }
    if (q.includes("how many") || q.includes("listings") || q.includes("count")) {
      return `You have ${propCount} active listing${propCount !== 1 ? "s" : ""}.`;
    }

    return "I can help with questions about availability, pricing, visits, amenities, and parking. Try asking one of those!";
  };

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInput("");

    setTimeout(() => {
      const response = generateResponse(msg);
      setMessages((prev) => [...prev, { role: "bot", text: response }]);
    }, 500);
  };

  if (!user) return null;

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-36 right-4 z-50 h-12 w-12 rounded-full gradient-blue shadow-elevated flex items-center justify-center"
        >
          <Bot className="h-6 w-6 text-primary-foreground" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-20 right-4 left-4 z-50 max-w-sm ml-auto bg-card rounded-2xl shadow-elevated border border-border flex flex-col" style={{ height: "420px" }}>
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <div className="h-8 w-8 rounded-full gradient-blue flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Property Assistant</p>
              <p className="text-[10px] text-muted-foreground">Auto-replies for tenants</p>
            </div>
            <button onClick={() => setOpen(false)} className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
              <X className="h-4 w-4 text-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-foreground rounded-bl-md"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
              {QUICK_REPLIES.slice(0, 3).map((qr) => (
                <button
                  key={qr}
                  onClick={() => handleSend(qr)}
                  className="text-[10px] bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-full"
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 bg-secondary rounded-full px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="h-9 w-9 rounded-full gradient-blue flex items-center justify-center disabled:opacity-50"
            >
              <Send className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerChatbot;
