import { useState } from "react";
import { MessageSquarePlus, Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = ["Overall Experience", "Landlord Response", "Maintenance", "Neighborhood", "Value for Money"];

const TenantFeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState(categories[0]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim() || rating === 0) {
      toast.error("Please fill all fields and give a rating");
      return;
    }
    const { error } = await supabase.from("feedback").insert({
      name, message: `[${category}] ${message}`, rating,
    });
    if (error) { toast.error("Failed to submit feedback"); return; }
    toast.success("Thank you for your feedback!");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-card text-center">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Star className="h-6 w-6 text-primary fill-primary" />
        </div>
        <h3 className="font-bold text-foreground">Thanks for your feedback!</h3>
        <p className="text-xs text-muted-foreground mt-1">Your response helps us improve</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquarePlus className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">Share Your Experience</h3>
      </div>

      <div className="space-y-3">
        <div className="flex gap-1 justify-center">
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} onClick={() => setRating(s)}>
              <Star className={`h-7 w-7 transition-colors ${s <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>

        <select value={category} onChange={e => setCategory(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>

        <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none" />

        <textarea placeholder="Tell us about your experience..." value={message} onChange={e => setMessage(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none resize-none h-20" />

        <Button onClick={handleSubmit} className="w-full gap-2" size="sm">
          <Send className="h-4 w-4" /> Submit Feedback
        </Button>
      </div>
    </div>
  );
};

export default TenantFeedbackForm;
