import { useState } from "react";
import { RotateCcw, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

interface VirtualTourViewerProps {
  images: string[];
  title: string;
}

const VirtualTourViewer = ({ images, title }: VirtualTourViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);

  const next = () => setCurrentIndex((i) => (i + 1) % images.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  const rotate = () => setRotation((r) => (r + 90) % 360);

  if (!images.length) return null;

  const Viewer = () => (
    <div className="relative group">
      <div className="overflow-hidden rounded-xl bg-black">
        <img
          src={images[currentIndex]}
          alt={`${title} - View ${currentIndex + 1}`}
          className="w-full object-contain transition-transform duration-300"
          style={{
            transform: `rotate(${rotation}deg)`,
            height: isFullscreen ? "70vh" : "240px",
          }}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/90 backdrop-blur rounded-full px-3 py-1.5 shadow-card">
        <button onClick={prev} className="h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center">
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
        <span className="text-xs font-medium text-foreground min-w-[40px] text-center">
          {currentIndex + 1}/{images.length}
        </span>
        <button onClick={next} className="h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center">
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
        <div className="w-px h-4 bg-border" />
        <button onClick={rotate} className="h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center">
          <RotateCcw className="h-3.5 w-3.5 text-foreground" />
        </button>
        {!isFullscreen && (
          <button onClick={() => setIsFullscreen(true)} className="h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center">
            <Maximize2 className="h-3.5 w-3.5 text-foreground" />
          </button>
        )}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === currentIndex ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          📸 Virtual Tour
        </h3>
        <Viewer />
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[80] bg-background/95 backdrop-blur flex flex-col items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-card shadow-card flex items-center justify-center z-10"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
          <div className="w-full max-w-2xl px-4">
            <Viewer />
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualTourViewer;
