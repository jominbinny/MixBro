import { AudioClip, formatDuration } from "@/lib/audioProcessor";
import { X, Music } from "lucide-react";
import { useState, useEffect } from "react";

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  onValueChange: (value: number) => void;
}

function NumberInput({ value, onValueChange, className, ...props }: NumberInputProps) {
  const [localValue, setLocalValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value.toString());
    }
  }, [value, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    if (val === '') return;
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onValueChange(num);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);
    if (localValue === '' || isNaN(parseFloat(localValue))) {
      setLocalValue(value.toString());
    }
    props.onBlur?.(e);
  };

  return (
    <input
      {...props}
      value={localValue}
      onChange={handleChange}
      onFocus={(e) => {
        setIsEditing(true);
        props.onFocus?.(e);
      }}
      onBlur={handleBlur}
      className={className}
    />
  );
}

interface AudioClipCardProps {
  clip: AudioClip;
  totalClips: number;
  onUpdate: (id: string, updates: Partial<AudioClip>) => void;
  onRemove: (id: string) => void;
}

export function AudioClipCard({ clip, totalClips, onUpdate, onRemove }: AudioClipCardProps) {
  return (
    <div className="glass-card rounded-lg p-3 relative group w-full min-w-0 overflow-hidden">
      <button
        onClick={() => onRemove(clip.id)}
        className="absolute top-2 right-2 p-1 rounded-md bg-muted/50 hover:bg-destructive text-muted-foreground hover:text-destructive-foreground transition-colors"
        aria-label="Remove clip"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-primary/15 text-primary">
          <Music className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate pr-10" title={clip.name}>
            {clip.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {formatDuration(clip.duration)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">
            Start
          </label>
          <NumberInput
            type="number"
            min={0}
            max={clip.endTime - 0.01}
            step={0.1}
            value={clip.startTime}
            onValueChange={(val) => onUpdate(clip.id, { startTime: val })}
            className="w-full max-w-full px-2 py-1.5 rounded-md bg-input border border-border text-foreground text-sm sm:text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">
            End
          </label>
          <NumberInput
            type="number"
            min={clip.startTime + 0.01}
            max={clip.duration}
            step={0.1}
            value={clip.endTime}
            onValueChange={(val) => onUpdate(clip.id, { endTime: val })}
            className="w-full max-w-full px-2 py-1.5 rounded-md bg-input border border-border text-foreground text-sm sm:text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">
            Order
          </label>
          <NumberInput
            type="number"
            min={1}
            max={totalClips}
            step={1}
            value={clip.order}
            onValueChange={(val) => {
              const safeVal = Math.min(Math.max(1, val), totalClips);
              onUpdate(clip.id, { order: safeVal });
            }}
            className="w-full max-w-full px-2 py-1.5 rounded-md bg-input border border-border text-foreground text-sm sm:text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span className="px-1.5 py-0.5 rounded bg-muted/50">
          {formatDuration(clip.startTime)} → {formatDuration(clip.endTime)}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-muted/50">
          {formatDuration(clip.endTime - clip.startTime)}
        </span>
      </div>
    </div>
  );
}