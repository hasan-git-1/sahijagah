import { useState, useRef } from "react";
import { Video, Play, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PropertyVideoProps {
  propertyId: string;
  videoUrl?: string | null;
  isOwner?: boolean;
}

const PropertyVideo = ({ propertyId, videoUrl, isOwner }: PropertyVideoProps) => {
  const [playing, setPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState(videoUrl || "");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video must be under 50MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${propertyId}/tour.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path);
      setUrl(urlData.publicUrl);
      toast.success("Video uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
    setUploading(false);
  };

  if (!url && !isOwner) return null;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          Video Tour
        </h3>
        {isOwner && (
          <>
            <Button onClick={() => fileRef.current?.click()} variant="outline" size="sm" className="gap-1 text-xs" disabled={uploading}>
              <Upload className="h-3 w-3" /> {uploading ? "Uploading..." : "Upload"}
            </Button>
            <input ref={fileRef} type="file" accept="video/*" onChange={handleUpload} className="hidden" />
          </>
        )}
      </div>

      {url ? (
        <div className="relative rounded-xl overflow-hidden bg-secondary">
          <video
            ref={videoRef}
            src={url}
            className="w-full rounded-xl"
            controls={playing}
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            preload="metadata"
          />
          {!playing && (
            <button
              onClick={() => videoRef.current?.play()}
              className="absolute inset-0 flex items-center justify-center bg-foreground/20"
            >
              <div className="h-14 w-14 rounded-full bg-card/90 flex items-center justify-center">
                <Play className="h-6 w-6 text-primary ml-1" />
              </div>
            </button>
          )}
        </div>
      ) : isOwner ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-input rounded-xl py-8 text-center cursor-pointer hover:bg-secondary/30 transition-colors"
        >
          <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Upload a video tour (max 50MB)</p>
        </div>
      ) : null}
    </div>
  );
};

export default PropertyVideo;
