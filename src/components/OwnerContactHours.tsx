import { Clock, Phone } from "lucide-react";

interface OwnerContactHoursProps {
  ownerName?: string;
}

const OwnerContactHours = ({ ownerName }: OwnerContactHoursProps) => {
  const hours = [
    { day: "Mon–Fri", time: "9:00 AM – 7:00 PM" },
    { day: "Sat", time: "10:00 AM – 5:00 PM" },
    { day: "Sun", time: "By Appointment" },
  ];

  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isSat = dayOfWeek === 6;
  const isAvailable = (isWeekday && hour >= 9 && hour < 19) || (isSat && hour >= 10 && hour < 17);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          Contact Hours
        </h3>
        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isAvailable ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-accent" : "bg-destructive"}`} />
          {isAvailable ? "Available Now" : "Unavailable"}
        </span>
      </div>

      {ownerName && (
        <p className="text-xs text-muted-foreground mb-2">
          Owner: <span className="font-semibold text-foreground">{ownerName}</span>
        </p>
      )}

      <div className="space-y-1.5">
        {hours.map((h) => (
          <div key={h.day} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{h.day}</span>
            <span className="font-medium text-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" /> {h.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerContactHours;
