import { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

interface VoiceRecorderProps {
  onRecorded: (audioUrl: string, duration: number) => void;
}

const VoiceRecorder = ({ onRecorded }: VoiceRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        onRecorded(url, duration);
        stream.getTracks().forEach((t) => t.stop());
        setDuration(0);
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      // Permission denied or not available
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-2">
      {recording ? (
        <>
          <div className="flex items-center gap-2 bg-destructive/10 rounded-full px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs font-mono text-destructive font-medium">{formatTime(duration)}</span>
          </div>
          <button
            onClick={stopRecording}
            className="h-10 w-10 rounded-full bg-destructive flex items-center justify-center"
          >
            <Square className="h-4 w-4 text-destructive-foreground" />
          </button>
        </>
      ) : (
        <button
          onClick={startRecording}
          className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <Mic className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};

export default VoiceRecorder;
