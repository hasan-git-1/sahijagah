import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

const ImageGallery = ({ images, alt = "Property" }: ImageGalleryProps) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [current, setCurrent] = useState(0);

  if (!images?.length) return null;

  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length);
  const next = () => setCurrent(c => (c + 1) % images.length);

  return (
    <>
      {/* Thumbnail strip */}
      <div className="flex gap-1.5 px-4 mt-3 overflow-x-auto hide-scrollbar">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setFullscreen(true); }}
            className={`h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${i === current ? "border-primary" : "border-transparent hover:border-primary/50"}`}
          >
            <img src={img} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Fullscreen gallery */}
      {fullscreen && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          <div className="flex items-center justify-between p-4">
            <span className="text-white text-sm font-medium">{current + 1} / {images.length}</span>
            <button onClick={() => setFullscreen(false)}>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center relative px-4">
            <img src={images[current]} alt={alt} className="max-h-full max-w-full object-contain rounded-lg" />
            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}
          </div>
          {/* Dots */}
          <div className="flex justify-center gap-1.5 pb-6">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-2 bg-white/40"}`} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
