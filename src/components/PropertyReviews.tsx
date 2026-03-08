import { useState } from "react";
import { Star, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PropertyReviewsProps {
  propertyId: string;
}

const PropertyReviews = ({ propertyId }: PropertyReviewsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: reviews } = useQuery({
    queryKey: ["reviews", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, profiles(name, profile_photo)")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").upsert(
        { property_id: propertyId, user_id: user!.id, rating, comment },
        { onConflict: "user_id,property_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", propertyId] });
      toast.success("Review submitted!");
      setShowForm(false);
      setComment("");
      setRating(0);
    },
    onError: () => toast.error("Failed to submit review"),
  });

  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const userReview = reviews?.find((r) => r.user_id === user?.id);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return "Today";
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-foreground">Reviews</h3>
          {avgRating && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" /> {avgRating} ({reviews?.length})
            </span>
          )}
        </div>
        {user && !userReview && (
          <button onClick={() => setShowForm(!showForm)} className="text-xs text-primary font-semibold">
            Write Review
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-3 shadow-card mb-3 space-y-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(s)}>
                <Star className={`h-6 w-6 transition-colors ${s <= (hovered || rating) ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="text-sm min-h-[60px]"
          />
          <Button
            size="sm"
            disabled={!rating || submitReview.isPending}
            onClick={() => submitReview.mutate()}
            className="gradient-blue text-primary-foreground border-0 gap-1"
          >
            <Send className="h-3.5 w-3.5" /> Submit
          </Button>
        </div>
      )}

      {reviews?.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground">No reviews yet. Be the first!</p>
      )}

      <div className="space-y-2">
        {reviews?.map((r: any) => (
          <div key={r.id} className="bg-card rounded-xl p-3 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full gradient-blue flex items-center justify-center">
                  <span className="text-primary-foreground text-[10px] font-bold">
                    {r.profiles?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{r.profiles?.name || "User"}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-2.5 w-2.5 ${s <= r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">{timeAgo(r.created_at)}</span>
            </div>
            {r.comment && <p className="text-xs text-muted-foreground mt-2">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyReviews;
