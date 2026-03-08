import { CheckCircle2, Circle, Clock } from "lucide-react";

interface TimelineStep {
  label: string;
  status: "completed" | "current" | "upcoming";
  date?: string;
}

const defaultSteps: TimelineStep[] = [
  { label: "Foundation & Structure", status: "completed", date: "Completed" },
  { label: "Brickwork & Plastering", status: "completed", date: "Completed" },
  { label: "Electrical & Plumbing", status: "current", date: "In Progress" },
  { label: "Flooring & Tiling", status: "upcoming", date: "Q3 2026" },
  { label: "Painting & Finishing", status: "upcoming", date: "Q4 2026" },
  { label: "Handover Ready", status: "upcoming", date: "Q1 2027" },
];

interface ConstructionTimelineProps {
  steps?: TimelineStep[];
}

const ConstructionTimeline = ({ steps = defaultSteps }: ConstructionTimelineProps) => {
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground">🏗️ Construction Progress</h3>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex gap-3">
            {/* Line + icon */}
            <div className="flex flex-col items-center">
              {step.status === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              ) : step.status === "current" ? (
                <Clock className="h-5 w-5 text-accent-foreground flex-shrink-0 animate-pulse" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
              )}
              {i < steps.length - 1 && (
                <div className={`w-0.5 h-6 ${step.status === "completed" ? "bg-primary" : "bg-border"}`} />
              )}
            </div>

            {/* Content */}
            <div className="pb-4">
              <p className={`text-sm font-medium ${
                step.status === "completed" ? "text-foreground" :
                step.status === "current" ? "text-primary font-semibold" :
                "text-muted-foreground"
              }`}>
                {step.label}
              </p>
              <p className={`text-[10px] ${
                step.status === "current" ? "text-primary" : "text-muted-foreground"
              }`}>
                {step.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConstructionTimeline;
