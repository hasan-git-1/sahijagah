import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  ownerId: string;
  userId: string;
  propertyTitle: string;
}

const BookingModal = ({ open, onOpenChange, propertyId, ownerId, userId, propertyTitle }: BookingModalProps) => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!date || !time) {
      toast.error("Please select date and time");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        property_id: propertyId,
        owner_id: ownerId,
        client_id: userId,
        scheduled_date: format(date, "yyyy-MM-dd"),
        scheduled_time: time,
        notes: notes || null,
      });
      if (error) throw error;
      toast.success("Visit booked successfully!");
      onOpenChange(false);
      setDate(undefined);
      setTime("");
      setNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to book visit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Book a Visit</DialogTitle>
          <p className="text-xs text-muted-foreground">{propertyTitle}</p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Date Picker */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Slots */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              <Clock className="inline h-4 w-4 mr-1" /> Select Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={cn(
                    "px-2 py-2 rounded-lg text-xs font-medium transition-colors",
                    time === t ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={2}
            />
          </div>

          <Button onClick={handleBook} disabled={loading} className="w-full gradient-cta text-accent-foreground border-0 font-semibold">
            {loading ? "Booking..." : "Confirm Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
