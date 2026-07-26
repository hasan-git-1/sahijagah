import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, Trash2, MapPin, BedDouble, BadgeCheck, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CardRef {
  id: string;
  highlight?: string;
  rank?: number;
}

interface PropertyRow {
  id: string;
  title: string;
  price: number;
  city: string;
  address?: string | null;
  type: string;
  bedrooms?: number | null;
  images?: string[] | null;
  is_verified?: boolean | null;
}

interface Message {
  role: "user" | "assistant";
  content: string; // display text (block stripped)
  cards?: PropertyRow[];
  highlights?: Record<string, string>;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/property-chat`;

const quickPrompts = [
  "2BHK rent in Gachibowli under 25k",
  "PG near Whitefield Bengaluru",
  "Commercial space in Pune",
  "Villas for sale in Hyderabad",
];

const formatPrice = (p: number, type: string) => {
  if (type === "rent" || type === "pg" || type === "hostel") {
    return `₹${p.toLocaleString("en-IN")}/mo`;
  }
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString("en-IN")}`;
};

const CARDS_RE = /```urbanstay-cards\s*([\s\S]*?)```/;

function parseCardsBlock(text: string): { clean: string; refs: CardRef[] } {
  const m = text.match(CARDS_RE);
  if (!m) return { clean: text, refs: [] };
  let refs: CardRef[] = [];
  try {
    const parsed = JSON.parse(m[1].trim());
    if (Array.isArray(parsed?.properties)) {
      refs = parsed.properties
        .filter((p: any) => typeof p?.id === "string")
        .map((p: any) => ({ id: p.id, highlight: p.highlight, rank: p.rank }));
    }
  } catch { /* ignore malformed */ }
  const clean = text.replace(CARDS_RE, "").trim();
  return { clean, refs };
}

const PropertyAssistant = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! 👋 I'm your urbanStay agent. Tell me the city, budget, and type (rent/sale/PG) and I'll pull real listings." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: msg };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: nextMsgs.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      const data = await resp.json();
      const raw: string = data.content || "";
      const { clean, refs } = parseCardsBlock(raw);

      let cards: PropertyRow[] = [];
      let highlights: Record<string, string> = {};
      if (refs.length > 0) {
        const ids = refs.map((r) => r.id);
        const { data: rows } = await supabase
          .from("properties")
          .select("id, title, price, city, address, type, bedrooms, images, is_verified")
          .in("id", ids)
          .eq("status", "approved");
        const byId = new Map((rows || []).map((r) => [r.id, r as PropertyRow]));
        cards = refs
          .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
          .map((r) => byId.get(r.id))
          .filter((r): r is PropertyRow => !!r);
        refs.forEach((r) => {
          if (r.highlight) highlights[r.id] = r.highlight;
        });
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: clean || "Here's what I found.", cards, highlights },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, something went wrong: ${e.message || "Please try again."}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      { role: "assistant", content: "Hey! 👋 I'm your urbanStay agent. Tell me the city, budget, and type (rent/sale/PG) and I'll pull real listings." },
    ]);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open urbanStay AI Agent"
        className="fixed bottom-36 right-4 z-50 h-14 w-14 rounded-full bg-foreground text-background shadow-elevated flex items-center justify-center animate-scale-in ring-4 ring-accent/30 hover:ring-accent/50 transition-all"
      >
        <span className="absolute inset-0 rounded-full bg-accent/25 animate-ping" aria-hidden />
        <Bot className="relative h-6 w-6" strokeWidth={2} />
        <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-accent text-accent-foreground text-[8px] font-bold uppercase tracking-wider flex items-center justify-center">AI</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col max-w-md mx-auto">
      <div className="bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">urbanStay Agent</p>
          <p className="text-[10px] text-muted-foreground">Searches live listings</p>
        </div>
        <button onClick={handleClear} className="mr-2" title="Clear chat">
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
        <button onClick={() => setOpen(false)} aria-label="Close">
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
              msg.role === "user"
                ? "bg-foreground text-background rounded-br-md"
                : "bg-card shadow-card text-foreground rounded-bl-md"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_strong]:text-foreground">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>

            {msg.cards && msg.cards.length > 0 && (
              <div className="mt-2 w-full max-w-[92%] space-y-2">
                {msg.cards.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setOpen(false);
                      navigate(`/app/property/${c.id}`);
                    }}
                    className="w-full flex gap-3 bg-card rounded-2xl overflow-hidden shadow-card text-left hover:shadow-elevated transition-shadow"
                  >
                    <img
                      src={c.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
                      alt={c.title}
                      className="h-24 w-24 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 py-2 pr-3 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-bold text-foreground truncate">{c.title}</p>
                        {c.is_verified && <BadgeCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                      </div>
                      <p className="text-base font-extrabold text-foreground mt-0.5">{formatPrice(Number(c.price), c.type)}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{c.city}</span>
                        {c.bedrooms ? <span className="flex items-center gap-0.5"><BedDouble className="h-3 w-3" />{c.bedrooms} BHK</span> : null}
                      </div>
                      {msg.highlights?.[c.id] && (
                        <p className="text-[11px] text-primary font-medium mt-1 truncate">{msg.highlights[c.id]}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-foreground">
                        View details <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
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

      <div className="px-4 py-3 bg-card border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="e.g. 2BHK in Madhapur under 30k"
            className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyAssistant;
