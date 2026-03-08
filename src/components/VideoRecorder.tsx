import { useState, useRef } from "react";
import { Video, Square, Upload, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VideoRecorderProps {
  onRecorded: (videoUrl: string) => void;
}

const VideoRecorder = ({ onRecorded }: VideoRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setPreview(url);
        onRecorded(url);
        stream.getTracks().forEach((t) => t.stop());
        setDuration(0);
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      toast.error("Camera access denied or not available");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const clearPreview = () => {
    setPreview(null);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <h3 className="font-bold text-foreground text-sm flex items-center gap-2 mb-3">
        <Video className="h-4 w-4 text-primary" /> Record Property Video
      </h3>

      {preview ? (
        <div className="relative">
          <video src={preview} controls className="w-full rounded-xl" />
          <button onClick={clearPreview} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>
      ) : (
        <>
          <div className="relative bg-secondary rounded-xl overflow-hidden aspect-video mb-3">
            <video ref={videoRef} muted className="w-full h-full object-cover" />
            {!recording && !preview && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
            {recording && (
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-destructive/90 rounded-full px-3 py-1">
                <div className="h-2 w-2 rounded-full bg-destructive-foreground animate-pulse" />
                <span className="text-xs font-mono text-destructive-foreground font-medium">{formatTime(duration)}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {recording ? (
              <Button onClick={stopRecording} variant="destructive" className="flex-1 gap-2">
                <Square className="h-4 w-4" /> Stop Recording
              </Button>
            ) : (
              <Button onClick={startRecording} className="flex-1 gradient-blue text-primary-foreground border-0 gap-2">
                <Video className="h-4 w-4" /> Start Recording
              </Button>
            )}
          </div>
        </>
      )}

      <p className="text-[10px] text-muted-foreground mt-2">Record a walkthrough video of your property (max 2 minutes recommended)</p>
    </div>
  );
};

export default VideoRecorder;
