import { Download, Play, Pause, RotateCcw, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDuration, audioBufferToMp3 } from "@/lib/audioProcessor";
import { toast } from "sonner";

interface MixOutputProps {
  audioBlob: Blob;
  audioBuffer: AudioBuffer | null;
  onReset: () => void;
}

export function MixOutput({ audioBlob, audioBuffer, onReset }: MixOutputProps) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [isExportingMp3, setIsExportingMp3] = useState(false);
  const [mp3Progress, setMp3Progress] = useState(0);

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

  const handleDownloadMp3 = async () => {
    if (!audioBuffer) return;
    setIsExportingMp3(true);
    setMp3Progress(0);
    try {
      const mp3Blob = await audioBufferToMp3(audioBuffer, (progress) => {
        setMp3Progress(progress);
      });
      const url = URL.createObjectURL(mp3Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "final_mix.mp3";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("MP3 downloaded successfully!");
    } catch (error) {
      console.error("MP3 export error:", error);
      toast.error(`Failed to export MP3: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExportingMp3(false);
      setMp3Progress(0);
    }
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
              className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary transition-all active:[&::-webkit-slider-thumb]:scale-110"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
        </div>


        {isExportingMp3 && (
          <div className="w-full bg-secondary/50 rounded-full h-1.5 mb-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${mp3Progress}%` }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <Download className="w-4 h-4" />
            WAV
          </button>

          <button
            onClick={handleDownloadMp3}
            disabled={!audioBuffer || isExportingMp3}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {isExportingMp3 ? (
              <span className="flex items-center gap-2 z-10">
                <Loader2 className="w-4 h-4 animate-spin" />
                {mp3Progress}%
              </span>
            ) : (
              <span className="flex items-center gap-2 z-10">
                <Download className="w-4 h-4" />
                MP3
              </span>
            )}
            {isExportingMp3 && (
              <div
                className="absolute left-0 top-0 bottom-0 bg-black/10 transition-all duration-300 ease-out"
                style={{ width: `${mp3Progress}%` }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}