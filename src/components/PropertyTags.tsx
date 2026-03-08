import { Flame, Sparkles, TrendingDown } from "lucide-react";

interface PropertyTagsProps {
  createdAt: string;
  viewCount?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
}

const PropertyTags = ({ createdAt, viewCount = 0, isFeatured, isVerified }: PropertyTagsProps) => {
  const tags: { label: string; icon: React.ElementType; className: string }[] = [];

  // "New" if created within last 7 days
  const daysSinceCreation = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceCreation <= 7) {
    tags.push({ label: "New", icon: Sparkles, className: "bg-primary/10 text-primary" });
  }

  // "Hot" if high views
  if (viewCount >= 50) {
    tags.push({ label: "Hot", icon: Flame, className: "bg-destructive/10 text-destructive" });
  }

  // Featured
  if (isFeatured) {
    tags.push({ label: "Featured", icon: TrendingDown, className: "bg-accent/10 text-accent" });
  }

  if (!tags.length) return null;

  return (
    <div className="flex gap-1">
      {tags.map(t => (
        <span key={t.label} className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${t.className}`}>
          <t.icon className="h-2.5 w-2.5" />
          {t.label}
        </span>
      ))}
    </div>
  );
};

export default PropertyTags;
