import { useState, useCallback } from "react";
import { FileUploader } from "@/components/FileUploader";
import { AudioClipCard } from "@/components/AudioClipCard";
import { MixOutput } from "@/components/MixOutput";
import { AudioClip, decodeAudioFile, validateClips, generateMix, formatDuration } from "@/lib/audioProcessor";
import { AlertCircle, Loader2, Headphones } from "lucide-react";
import { toast } from "sonner";
export default function Index() {
  const [clips, setClips] = useState<AudioClip[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalMix, setFinalMix] = useState<Blob | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const handleFilesSelected = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    setErrors([]);
    const newClips: AudioClip[] = [];
    const fileArray = Array.from(files);
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (!file.name.endsWith(".mp3") && !file.name.endsWith(".wav")) {
        toast.error(`Unsupported format: ${file.name}`);
        continue;
      }
      try {
        const audioBuffer = await decodeAudioFile(file);
        const duration = audioBuffer.duration;
        newClips.push({
          id: `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          name: file.name,
          duration,
          startTime: 0,
          endTime: duration,
          order: clips.length + newClips.length + 1,
          audioBuffer
        });
        toast.success(`Loaded: ${file.name}`);
      } catch (error) {
        toast.error(`Failed to decode: ${file.name}`);
        console.error(`Error decoding ${file.name}:`, error);
      }
    }
    setClips(prev => [...prev, ...newClips]);
    setIsProcessing(false);
  }, [clips.length]);
  const handleUpdateClip = useCallback((id: string, updates: Partial<AudioClip>) => {
    setClips(prev => prev.map(clip => clip.id === id ? {
      ...clip,
      ...updates
    } : clip));
    setErrors([]);
  }, []);
  const handleRemoveClip = useCallback((id: string) => {
    setClips(prev => prev.filter(clip => clip.id !== id));
    setErrors([]);
  }, []);
  const handleGenerateMix = async () => {
    const validationErrors = validateClips(clips);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsGenerating(true);
    setErrors([]);
    try {
      const mixBlob = await generateMix(clips);
      setFinalMix(mixBlob);
      toast.success("Mix generated successfully!");
    } catch (error) {
      toast.error("Failed to generate mix");
      console.error("Mix generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  const handleReset = () => {
    setFinalMix(null);
    setClips([]);
    setErrors([]);
  };
  const totalDuration = clips.reduce((sum, clip) => sum + (clip.endTime - clip.startTime), 0);
  return <div className="min-h-screen">
      <header className="border-b border-border/30 bg-card/40 backdrop-blur-md sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto py-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-primary/15 text-primary">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-playfair font-semibold text-foreground">
                MixBro
              </h1>
              <p className="text-xs text-muted-foreground font-lora">Audio Mixer</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto py-8 px-4">
        {finalMix ? <MixOutput audioBlob={finalMix} onReset={handleReset} /> : <div className="space-y-6">
            <FileUploader onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />

            {clips.length === 0 && !isProcessing && <p className="text-center text-lg font-lora italic text-primary/80 text-warm-glow">
                Curate your dance symphony
              </p>}

            {isProcessing && <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground font-lora text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading audio files...</span>
              </div>}

            {clips.length > 0 && <>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground font-playfair">
                    Audio Clips ({clips.length})
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    Total: {formatDuration(totalDuration)}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {clips.map(clip => <AudioClipCard key={clip.id} clip={clip} totalClips={clips.length} onUpdate={handleUpdateClip} onRemove={handleRemoveClip} />)}
                </div>

                {errors.length > 0 && <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">
                          Please fix the following:
                        </p>
                        <ul className="mt-1 space-y-0.5 text-xs text-destructive/80">
                          {errors.map((error, i) => <li key={i}>• {error}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>}

                <button onClick={handleGenerateMix} disabled={isGenerating || clips.length === 0} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-playfair font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all warm-glow flex items-center justify-center gap-2">
                  {isGenerating ? <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </> : "Generate Mix"}
                </button>
              </>}
          </div>}
      </main>
    </div>;
}