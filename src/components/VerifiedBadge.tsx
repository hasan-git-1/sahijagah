import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  isVerified?: boolean | null;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const VerifiedBadge = ({ isVerified, size = "sm", showLabel = false }: VerifiedBadgeProps) => {
  if (!isVerified) return null;

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <span className="inline-flex items-center gap-0.5 text-primary" title="Verified">
      <BadgeCheck className={iconSize} />
      {showLabel && <span className="text-[10px] font-semibold">Verified</span>}
    </span>
  );
};

export default VerifiedBadge;
