import { useState } from "react";
import { Calendar, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimeSlot {
  day: string;
  slots: string[];
}

interface AvailabilityCalendarProps {
  onSlotsChange?: (slots: TimeSlot[]) => void;
  readOnly?: boolean;
  initialSlots?: TimeSlot[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

const AvailabilityCalendar = ({ onSlotsChange, readOnly = false, initialSlots }: AvailabilityCalendarProps) => {
  const [slots, setSlots] = useState<TimeSlot[]>(
    initialSlots || DAYS.map((day) => ({ day, slots: [] }))
  );
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const toggleSlot = (day: string, time: string) => {
    if (readOnly) return;
    const updated = slots.map((s) => {
      if (s.day !== day) return s;
      const hasSlot = s.slots.includes(time);
      return {
        ...s,
        slots: hasSlot ? s.slots.filter((t) => t !== time) : [...s.slots, time],
      };
    });
    setSlots(updated);
    onSlotsChange?.(updated);
  };

  const toggleAllDay = (day: string) => {
    if (readOnly) return;
    const daySlots = slots.find((s) => s.day === day);
    const allSelected = daySlots?.slots.length === TIME_SLOTS.length;
    const updated = slots.map((s) => {
      if (s.day !== day) return s;
      return { ...s, slots: allSelected ? [] : [...TIME_SLOTS] };
    });
    setSlots(updated);
    onSlotsChange?.(updated);
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        {readOnly ? "Available Visit Slots" : "Set Availability"}
      </h3>

      <div className="space-y-1.5">
        {slots.map((daySlot) => {
          const isExpanded = expandedDay === daySlot.day;
          const slotCount = daySlot.slots.length;

          return (
            <div key={daySlot.day}>
              <button
                onClick={() => setExpandedDay(isExpanded ? null : daySlot.day)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground w-8">{daySlot.day}</span>
                  {slotCount > 0 ? (
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {slotCount} slot{slotCount !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">No slots</span>
                  )}
                </div>
                {!readOnly && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleAllDay(daySlot.day); }}
                    className="text-[10px] text-primary font-medium"
                  >
                    {slotCount === TIME_SLOTS.length ? "Clear all" : "Select all"}
                  </button>
                )}
              </button>

              {isExpanded && (
                <div className="flex flex-wrap gap-1.5 px-3 py-2">
                  {TIME_SLOTS.map((time) => {
                    const isActive = daySlot.slots.includes(time);
                    return (
                      <button
                        key={time}
                        onClick={() => toggleSlot(daySlot.day, time)}
                        disabled={readOnly && !isActive}
                        className={`flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-full transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : readOnly
                            ? "bg-secondary/50 text-muted-foreground"
                            : "bg-secondary text-foreground hover:bg-primary/10"
                        }`}
                      >
                        <Clock className="h-2.5 w-2.5" />
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
