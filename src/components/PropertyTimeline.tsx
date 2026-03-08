import { Clock, Eye, Edit, CheckCircle, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  createdAt: string;
  updatedAt: string;
  viewCount: number | null;
  isVerified: boolean | null;
  status: string;
}

const PropertyTimeline = ({ createdAt, updatedAt, viewCount, isVerified, status }: Props) => {
  const events = [
    {
      icon: Tag,
      label: "Listed",
      time: formatDistanceToNow(new Date(createdAt), { addSuffix: true }),
      color: "text-primary",
    },
    ...(createdAt !== updatedAt ? [{
      icon: Edit,
      label: "Last Updated",
      time: formatDistanceToNow(new Date(updatedAt), { addSuffix: true }),
      color: "text-blue-500",
    }] : []),
    ...(isVerified ? [{
      icon: CheckCircle,
      label: "Verified by Team",
      time: "",
      color: "text-green-500",
    }] : []),
    {
      icon: Eye,
      label: `${viewCount || 0} total views`,
      time: "",
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">Listing Timeline</h3>
      </div>

      <div className="relative pl-6 space-y-3">
        <div className="absolute left-2.5 top-1 bottom-1 w-px bg-border" />
        {events.map((e, i) => {
          const Icon = e.icon;
          return (
            <div key={i} className="relative flex items-center gap-3">
              <div className="absolute -left-3.5 h-5 w-5 rounded-full bg-card border-2 border-border flex items-center justify-center">
                <Icon className={`h-3 w-3 ${e.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{e.label}</p>
                {e.time && <p className="text-[10px] text-muted-foreground">{e.time}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyTimeline;
