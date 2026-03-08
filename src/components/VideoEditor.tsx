import { useState, useRef, useEffect } from "react";
import { Scissors, Play, Pause, RotateCcw, Download, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface VideoEditorProps {
  videoUrl: string;
  onSave?: (blob: Blob) => void;
}

const filters = [
  { name: "Normal", css: "none" },
  { name: "Bright", css: "brightness(1.3)" },
  { name: "Warm", css: "sepia(0.4) saturate(1.3)" },
  { name: "Cool", css: "hue-rotate(30deg) saturate(1.2)" },
  { name: "B&W", css: "grayscale(1)" },
  { name: "High Contrast", css: "contrast(1.5)" },
  { name: "Vintage", css: "sepia(0.6) contrast(1.1) brightness(0.9)" },
  { name: "Vivid", css: "saturate(1.8) contrast(1.1)" },
];

const VideoEditor = ({ videoUrl, onSave }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Normal");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      setDuration(video.duration);
      setTrimEnd(video.duration);
    };
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= trimEnd) {
        video.pause();
        setPlaying(false);
      }
    };
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [trimEnd]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      if (video.currentTime < trimStart || video.currentTime >= trimEnd) {
        video.currentTime = trimStart;
      }
      video.play();
    }
    setPlaying(!playing);
  };

  const resetTrim = () => {
    setTrimStart(0);
    setTrimEnd(duration);
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const selectedFilter = filters.find(f => f.name === activeFilter)?.css || "none";

  const handleExport = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsExporting(true);
    toast.info("Exporting video... this may take a moment");

    try {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        if (onSave) {
          onSave(blob);
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "edited-video.webm";
          a.click();
          URL.revokeObjectURL(url);
        }
        setIsExporting(false);
        toast.success("Video exported!");
      };

      video.currentTime = trimStart;
      await new Promise<void>((resolve) => { video.onseeked = () => resolve(); });

      mediaRecorder.start();
      video.play();

      const drawFrame = () => {
        if (video.currentTime >= trimEnd || video.paused) {
          video.pause();
          mediaRecorder.stop();
          return;
        }
        ctx.filter = selectedFilter;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawFrame);
      };
      drawFrame();
    } catch {
      toast.error("Export failed");
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card space-y-4">
      <div className="flex items-center gap-2">
        <Scissors className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-foreground text-sm">Video Editor</h3>
      </div>

      {/* Video Preview */}
      <div className="relative rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full max-h-48 object-contain"
          style={{ filter: selectedFilter }}
          playsInline
        />
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
        >
          {playing ? <Pause className="h-10 w-10 text-white" /> : <Play className="h-10 w-10 text-white" />}
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Timeline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{formatTime(trimStart)}</span>
          <span className="font-semibold text-foreground">{formatTime(currentTime)}</span>
          <span>{formatTime(trimEnd)}</span>
        </div>

        {/* Trim range */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground font-medium">Trim Start</label>
          <Slider
            value={[trimStart]}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={([v]) => {
              setTrimStart(Math.min(v, trimEnd - 0.5));
              if (videoRef.current) videoRef.current.currentTime = v;
            }}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground font-medium">Trim End</label>
          <Slider
            value={[trimEnd]}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={([v]) => {
              setTrimEnd(Math.max(v, trimStart + 0.5));
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Duration: {formatTime(trimEnd - trimStart)}
          </span>
          <button onClick={resetTrim} className="text-xs text-primary flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Filters</span>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {filters.map((f) => (
            <button
              key={f.name}
              onClick={() => setActiveFilter(f.name)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-colors ${
                activeFilter === f.name ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Export */}
      <Button onClick={handleExport} disabled={isExporting} className="w-full gap-2">
        <Download className="h-4 w-4" />
        {isExporting ? "Exporting..." : "Export Trimmed Video"}
      </Button>
    </div>
  );
};

export default VideoEditor;
