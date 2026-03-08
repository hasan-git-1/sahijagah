import { useState } from "react";
import { Layers, X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface FloorPlanViewerProps {
  images: string[];
  title: string;
}

const FloorPlanViewer = ({ images, title }: FloorPlanViewerProps) => {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // Use last image as floor plan placeholder
  const planImage = images[images.length - 1];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center gap-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Layers className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-foreground">Floor Plan</p>
          <p className="text-[10px] text-muted-foreground">Tap to view layout</p>
        </div>
        <ZoomIn className="h-4 w-4 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-card">
          <DialogTitle className="px-4 pt-4 text-sm font-bold text-foreground">
            {title} — Floor Plan
          </DialogTitle>
          <div className="p-4">
            <img
              src={planImage}
              alt="Floor plan"
              className="w-full rounded-xl object-contain max-h-[60vh]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloorPlanViewer;
