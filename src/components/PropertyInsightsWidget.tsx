import { Eye, Heart, MessageSquare, Calendar, TrendingUp } from "lucide-react";

interface PropertyInsightsWidgetProps {
  viewCount: number;
  propertyId: string;
}

const PropertyInsightsWidget = ({ viewCount, propertyId }: PropertyInsightsWidgetProps) => {
  // Generate pseudo metrics from view count
  const inquiries = Math.max(1, Math.round(viewCount * 0.15));
  const wishlistAdds = Math.max(1, Math.round(viewCount * 0.08));
  const bookings = Math.max(0, Math.round(viewCount * 0.03));
  const score = Math.min(100, Math.round(viewCount * 0.8 + inquiries * 3 + wishlistAdds * 2));

  const metrics = [
    { icon: Eye, label: "Views", value: viewCount, color: "text-primary" },
    { icon: MessageSquare, label: "Inquiries", value: inquiries, color: "text-accent" },
    { icon: Heart, label: "Saved", value: wishlistAdds, color: "text-destructive" },
    { icon: Calendar, label: "Bookings", value: bookings, color: "text-primary" },
  ];

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Property Performance
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="h-8 w-8 rounded-full gradient-blue flex items-center justify-center">
            <span className="text-primary-foreground text-[10px] font-extrabold">{score}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Score</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-secondary/50 rounded-xl p-2.5 text-center">
              <Icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
              <p className="text-sm font-bold text-foreground">{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 bg-secondary/50 rounded-xl p-2.5">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">Engagement Score</span>
          <span className="font-bold text-foreground">{score}/100</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${score}%`,
              background: score >= 70 ? "hsl(var(--accent))" : score >= 40 ? "hsl(var(--primary))" : "hsl(var(--destructive))",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyInsightsWidget;
