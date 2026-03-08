import { useState, useRef } from "react";
import { Camera, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploaderProps {
  userId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUploader = ({ userId, images, onImagesChange, maxImages = 5 }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const ext = file.name.split(".").pop();
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage.from("property-images").upload(path, file);
        if (error) throw error;

        const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
      }

      onImagesChange([...images, ...newUrls]);
      toast.success(`${newUrls.length} image(s) uploaded`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center"
            >
              <X className="h-3 w-3 text-destructive-foreground" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-input bg-secondary/50 flex flex-col items-center justify-center gap-1 hover:bg-secondary transition-colors"
          >
            {uploading ? (
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Camera className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />

      <p className="text-[10px] text-muted-foreground mt-2">{images.length}/{maxImages} photos · Max 5MB each</p>
    </div>
  );
};

export default ImageUploader;
