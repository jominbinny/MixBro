import { AudioClip, formatDuration } from "@/lib/audioProcessor";
import { X, Music } from "lucide-react";

interface AudioClipCardProps {
  clip: AudioClip;
  totalClips: number;
  onUpdate: (id: string, updates: Partial<AudioClip>) => void;
  onRemove: (id: string) => void;
}

export function AudioClipCard({ clip, totalClips, onUpdate, onRemove }: AudioClipCardProps) {
  return (
    <div className="glass-card rounded-lg p-3 relative group">
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
          <h3 className="text-sm font-medium text-foreground truncate pr-6" title={clip.name}>
            {clip.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {formatDuration(clip.duration)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">
            Start
          </label>
          <input
            type="number"
            min={0}
            max={clip.endTime - 0.01}
            step={0.1}
            value={clip.startTime}
            onChange={(e) =>
              onUpdate(clip.id, { startTime: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-2 py-1.5 rounded-md bg-input border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">
            End
          </label>
          <input
            type="number"
            min={clip.startTime + 0.01}
            max={clip.duration}
            step={0.1}
            value={clip.endTime}
            onChange={(e) =>
              onUpdate(clip.id, { endTime: parseFloat(e.target.value) || clip.duration })
            }
            className="w-full px-2 py-1.5 rounded-md bg-input border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">
            Order
          </label>
          <input
            type="number"
            min={1}
            max={totalClips}
            step={1}
            value={clip.order}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              onUpdate(clip.id, { order: Math.min(Math.max(1, val), totalClips) });
            }}
            className="w-full px-2 py-1.5 rounded-md bg-input border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
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