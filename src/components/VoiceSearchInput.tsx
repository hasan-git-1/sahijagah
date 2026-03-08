import { useState, useRef } from "react";
import { Mic, MicOff, Search } from "lucide-react";
import { toast } from "sonner";

interface VoiceSearchInputProps {
  onResult: (text: string) => void;
}

const VoiceSearchInput = ({ onResult }: VoiceSearchInputProps) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice search not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
      toast.success(`Searching: "${transcript}"`);
    };

    recognition.onerror = () => {
      setListening(false);
      toast.error("Could not recognize speech. Try again.");
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
        listening
          ? "bg-destructive text-destructive-foreground animate-pulse"
          : "bg-primary/10 text-primary hover:bg-primary/20"
      }`}
      title="Voice Search"
    >
      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
};

export default VoiceSearchInput;
