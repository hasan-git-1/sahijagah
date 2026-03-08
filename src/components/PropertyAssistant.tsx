import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  "2BHK flats in Hyderabad under ₹20L",
  "PG near Whitefield Bengaluru",
  "Commercial space in Pune",
  "Apartments for rent in Mumbai",
];

const PropertyAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! 👋 I'm your Sahi Jagah assistant. Tell me what kind of property you're looking for and I'll help you find it!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Search properties based on user query
      const keywords = msg.toLowerCase().split(/\s+/);
      const cityKeywords = ["hyderabad", "bengaluru", "bangalore", "pune", "mumbai", "chennai"];
      const typeKeywords: Record<string, string> = { rent: "rent", buy: "sale", sale: "sale", pg: "pg", commercial: "commercial" };

      let query = supabase.from("properties").select("*").eq("status", "active").limit(5);

      const foundCity = cityKeywords.find((c) => keywords.some((k) => k.includes(c)));
      if (foundCity) {
        const cityName = foundCity.charAt(0).toUpperCase() + foundCity.slice(1);
        query = query.ilike("city", `%${cityName}%`);
      }

      const foundType = Object.keys(typeKeywords).find((t) => keywords.includes(t));
      if (foundType) {
        query = query.eq("type", typeKeywords[foundType]);
      }

      // Check for bedroom count
      const bhkMatch = msg.match(/(\d)\s*bhk/i);
      if (bhkMatch) {
        query = query.eq("bedrooms", parseInt(bhkMatch[1]));
      }

      const { data: properties } = await query;

      let response = "";
      if (properties && properties.length > 0) {
        response = `I found ${properties.length} properties matching your search:\n\n`;
        properties.forEach((p, i) => {
          const price = p.price >= 10000000 ? `₹${(p.price / 10000000).toFixed(1)} Cr` :
            p.price >= 100000 ? `₹${(p.price / 100000).toFixed(1)} L` :
            `₹${p.price.toLocaleString("en-IN")}`;
          response += `${i + 1}. **${p.title}** - ${price}\n📍 ${p.city}${p.bedrooms ? ` · ${p.bedrooms} BHK` : ""}\n\n`;
        });
        response += "Would you like to see any of these properties in detail? Or refine your search?";
      } else {
        response = "I couldn't find exact matches for that query. Try specifying:\n\n• **City**: Hyderabad, Bengaluru, Pune, Mumbai, Chennai\n• **Type**: Rent, Buy, PG, Commercial\n• **Size**: 1BHK, 2BHK, 3BHK\n\nFor example: \"2BHK for rent in Hyderabad\"";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full gradient-blue shadow-elevated flex items-center justify-center animate-scale-in"
      >
        <Bot className="h-6 w-6 text-primary-foreground" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <div className="h-9 w-9 rounded-full gradient-blue flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Sahi Jagah Assistant</p>
          <p className="text-[10px] text-muted-foreground">AI-powered property search</p>
        </div>
        <button onClick={() => setOpen(false)}>
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
              msg.role === "user"
                ? "gradient-blue text-primary-foreground rounded-br-md"
                : "bg-card shadow-card text-foreground rounded-bl-md"
            }`}>
              {msg.content.split("\n").map((line, j) => (
                <p key={j} className={j > 0 ? "mt-1" : ""}>
                  {line.replace(/\*\*(.*?)\*\*/g, "").includes("**")
                    ? line
                    : line.split("**").map((part, k) =>
                        k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                      )}
                </p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card shadow-card rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
          {quickPrompts.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="flex-shrink-0 bg-card shadow-card rounded-full px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-card border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about properties..."
            className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="h-10 w-10 rounded-full gradient-blue flex items-center justify-center disabled:opacity-50"
          >
            <Send className="h-4 w-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyAssistant;
