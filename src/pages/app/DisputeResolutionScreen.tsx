import { ArrowLeft, AlertTriangle, MessageSquare, Clock, CheckCircle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface Dispute {
  id: string;
  subject: string;
  category: string;
  status: "open" | "in_review" | "resolved";
  createdAt: string;
  messages: { sender: string; text: string; time: string }[];
}

const DisputeResolutionScreen = () => {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: "1",
      subject: "Security deposit not returned",
      category: "Deposit",
      status: "open",
      createdAt: "2026-03-01",
      messages: [
        { sender: "You", text: "Owner hasn't returned my deposit after 30 days of move-out.", time: "Mar 1" },
        { sender: "Support", text: "We've notified the owner. They have 7 days to respond.", time: "Mar 2" },
      ],
    },
  ]);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Deposit");
  const [description, setDescription] = useState("");

  const categories = ["Deposit", "Maintenance", "Rent", "Noise", "Contract", "Other"];
  const statusColors: Record<string, string> = {
    open: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    in_review: "bg-primary/10 text-primary",
    resolved: "bg-accent/10 text-accent",
  };
  const statusIcons: Record<string, React.ElementType> = { open: AlertTriangle, in_review: Clock, resolved: CheckCircle };

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) { toast.error("Fill all fields"); return; }
    const newDispute: Dispute = {
      id: Date.now().toString(),
      subject,
      category,
      status: "open",
      createdAt: new Date().toISOString().split("T")[0],
      messages: [{ sender: "You", text: description, time: "Just now" }],
    };
    setDisputes([newDispute, ...disputes]);
    setShowNew(false);
    setSubject("");
    setDescription("");
    toast.success("Dispute submitted! Our team will review within 48 hours.");
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">Dispute Resolution</h2>
      </div>

      <div className="px-4 pt-4">
        <Button onClick={() => setShowNew(!showNew)} className="w-full gradient-blue text-primary-foreground border-0 gap-2">
          <AlertTriangle className="h-4 w-4" /> Raise New Dispute
        </Button>

        {showNew && (
          <div className="mt-4 bg-card rounded-2xl p-4 shadow-card space-y-3">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  {c}
                </button>
              ))}
            </div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your issue in detail..." rows={3} className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none" />
            <Button onClick={handleSubmit} className="w-full gap-2"><Send className="h-4 w-4" /> Submit Dispute</Button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <h3 className="font-bold text-foreground text-sm">Your Disputes</h3>
          {disputes.map((d) => {
            const StatusIcon = statusIcons[d.status];
            return (
              <div key={d.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-foreground text-sm">{d.subject}</p>
                    <p className="text-[10px] text-muted-foreground">{d.category} · {d.createdAt}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${statusColors[d.status]}`}>
                    <StatusIcon className="h-3 w-3" /> {d.status.replace("_", " ")}
                  </span>
                </div>
                <div className="space-y-2 mt-3">
                  {d.messages.map((m, i) => (
                    <div key={i} className={`p-2.5 rounded-xl text-xs ${m.sender === "You" ? "bg-primary/10 text-foreground ml-4" : "bg-secondary text-foreground mr-4"}`}>
                      <span className="font-bold">{m.sender}</span>
                      <span className="text-muted-foreground ml-2 text-[10px]">{m.time}</span>
                      <p className="mt-0.5">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DisputeResolutionScreen;
