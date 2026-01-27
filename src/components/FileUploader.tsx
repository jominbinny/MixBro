import { Music } from "lucide-react";
import { useRef } from "react";

interface FileUploaderProps {
  onFilesSelected: (files: FileList) => void;
  isProcessing: boolean;
}

export function FileUploader({ onFilesSelected, isProcessing }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const audioFiles = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === "audio/mpeg" || f.type === "audio/wav" || f.name.endsWith(".mp3") || f.name.endsWith(".wav")
      );
      if (audioFiles.length > 0) {
        const dt = new DataTransfer();
        audioFiles.forEach((f) => dt.items.add(f));
        onFilesSelected(dt.files);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="glass-card rounded-xl p-6 md:p-8 text-center hover:border-primary/50 transition-all cursor-pointer warm-glow max-w-lg mx-auto"
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".mp3,.wav,audio/mpeg,audio/wav"
        multiple
        onChange={handleChange}
        className="hidden"
        disabled={isProcessing}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 rounded-full bg-primary/20 text-primary animate-float">
          <Music className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xl font-heading italic text-foreground text-warm-glow">
            Drop your tracks here
          </p>
          <p className="text-sm font-sans italic text-primary/90">
            Or click to explore your soundscape
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            MP3 & WAV formats
          </p>
        </div>
      </div>
    </div>
  );
}