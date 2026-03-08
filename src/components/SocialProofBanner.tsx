import { Users, Eye, Clock } from "lucide-react";

interface SocialProofBannerProps {
  viewCount: number;
  createdAt: string;
}

const SocialProofBanner = ({ viewCount, createdAt }: SocialProofBannerProps) => {
  const hoursAgo = Math.max(1, Math.round((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)));
  const recentViews = Math.max(1, Math.round(viewCount * 0.3));
  const isHot = viewCount > 20;
  const isNew = hoursAgo < 48;

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
      {isHot && (
        <div className="flex items-center gap-1.5 bg-destructive/10 text-destructive px-3 py-1.5 rounded-full flex-shrink-0">
          <span className="text-xs">🔥</span>
          <span className="text-[10px] font-semibold">Hot Property</span>
        </div>
      )}
      <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full flex-shrink-0">
        <Users className="h-3 w-3" />
        <span className="text-[10px] font-semibold">{recentViews} viewed recently</span>
      </div>
      {isNew && (
        <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-full flex-shrink-0">
          <Clock className="h-3 w-3" />
          <span className="text-[10px] font-semibold">New listing</span>
        </div>
      )}
    </div>
  );
};

export default SocialProofBanner;
