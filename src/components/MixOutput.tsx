import { Download, Play, Pause, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDuration } from "@/lib/audioProcessor";

interface MixOutputProps {
  audioBlob: Blob;
  onReset: () => void;
}

export function MixOutput({ audioBlob, onReset }: MixOutputProps) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    
    const audioElement = new Audio(url);
    
    audioElement.addEventListener("loadedmetadata", () => {
      setDuration(audioElement.duration);
    });
    
    audioElement.addEventListener("timeupdate", () => {
      setCurrentTime(audioElement.currentTime);
    });
    
    audioElement.addEventListener("play", () => setIsPlaying(true));
    audioElement.addEventListener("pause", () => setIsPlaying(false));
    audioElement.addEventListener("ended", () => setIsPlaying(false));
    
    setAudio(audioElement);
    
    return () => {
      audioElement.pause();
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  const togglePlay = () => {
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "final_mix.wav";
    a.click();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-primary">Mix Complete!</h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-secondary-foreground text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          New Mix
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.01}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Mix
        </button>
      </div>
    </div>
  );
}