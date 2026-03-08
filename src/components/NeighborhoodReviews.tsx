import { useState } from "react";
import { Star, MapPin, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NeighborhoodReviewsProps {
  city: string;
  locality?: string;
}

const mockReviews = [
  { id: "1", user: "Rahul M.", rating: 4, text: "Great locality, peaceful and well-connected. Water supply is consistent.", date: "2 weeks ago", helpful: 12 },
  { id: "2", user: "Priya S.", rating: 5, text: "Love living here! Markets, schools, and hospitals all nearby. Highly recommend.", date: "1 month ago", helpful: 8 },
  { id: "3", user: "Amit K.", rating: 3, text: "Decent area but traffic can be heavy during peak hours. Parking is an issue.", date: "2 months ago", helpful: 5 },
];

const NeighborhoodReviews = ({ city, locality }: NeighborhoodReviewsProps) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const avgRating = (mockReviews.reduce((s, r) => s + r.rating, 0) / mockReviews.length).toFixed(1);

  const handleSubmit = () => {
    if (!user) { toast.error("Sign in to review"); return; }
    if (rating === 0) { toast.error("Select a rating"); return; }
    toast.success("Review submitted! Thank you.");
    setShowForm(false);
    setRating(0);
    setComment("");
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Area Reviews
        </h3>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-foreground">{avgRating}</span>
          <span className="text-[10px] text-muted-foreground">({mockReviews.length})</span>
        </div>
      </div>

      <div className="space-y-3 mb-3">
        {mockReviews.map((r) => (
          <div key={r.id} className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-foreground">{r.user}</span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                ))}
              </div>
            </div>
            <p className="text-xs text-foreground leading-relaxed">{r.text}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-muted-foreground">{r.date}</span>
              <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">
                <ThumbsUp className="h-3 w-3" /> {r.helpful} helpful
              </button>
            </div>
          </div>
        ))}
      </div>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} variant="outline" size="sm" className="w-full">
          Write Area Review
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} onClick={() => setRating(i + 1)}>
                <Star className={`h-6 w-6 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience about this area..."
            className="text-sm"
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmit} size="sm" className="flex-1 gradient-blue text-primary-foreground border-0">Submit</Button>
            <Button onClick={() => setShowForm(false)} variant="outline" size="sm">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeighborhoodReviews;
