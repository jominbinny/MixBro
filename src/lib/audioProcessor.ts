export interface AudioClip {
  id: string;
  file: File;
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  order: number;
  audioBuffer: AudioBuffer | null;
}

export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const audioContext = new AudioContext();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  await audioContext.close();
  return audioBuffer;
}

export function trimAudioBuffer(
  audioBuffer: AudioBuffer,
  startTime: number,
  endTime: number
): AudioBuffer {
  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.floor(endTime * sampleRate);
  const length = endSample - startSample;

  if (length <= 0) {
    throw new Error("Invalid trim range: start time must be less than end time");
  }

  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    length,
    sampleRate
  );

  const trimmedBuffer = offlineContext.createBuffer(
    audioBuffer.numberOfChannels,
    length,
    sampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const sourceData = audioBuffer.getChannelData(channel);
    const targetData = trimmedBuffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      targetData[i] = sourceData[startSample + i] || 0;
    }
  }

  return trimmedBuffer;
}

export function concatenateAudioBuffers(buffers: AudioBuffer[]): AudioBuffer {
  if (buffers.length === 0) {
    throw new Error("No audio buffers to concatenate");
  }

  const sampleRate = buffers[0].sampleRate;
  const numberOfChannels = Math.max(...buffers.map((b) => b.numberOfChannels));
  const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);

  const offlineContext = new OfflineAudioContext(
    numberOfChannels,
    totalLength,
    sampleRate
  );

  const resultBuffer = offlineContext.createBuffer(
    numberOfChannels,
    totalLength,
    sampleRate
  );

  let offset = 0;
  for (const buffer of buffers) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const targetData = resultBuffer.getChannelData(channel);
      const sourceData =
        channel < buffer.numberOfChannels
          ? buffer.getChannelData(channel)
          : buffer.getChannelData(0);

      for (let i = 0; i < buffer.length; i++) {
        targetData[offset + i] = sourceData[i];
      }
    }
    offset += buffer.length;
  }

  return resultBuffer;
}

export function audioBufferToWav(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataLength = audioBuffer.length * blockAlign;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  // Interleave channels and write audio data
  const channelData: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channelData.push(audioBuffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export function validateClips(clips: AudioClip[]): string[] {
  const errors: string[] = [];
  const orders = new Set<number>();

  for (const clip of clips) {
    if (clip.startTime < 0) {
      errors.push(`${clip.name}: Start time cannot be negative`);
    }
    if (clip.endTime <= clip.startTime) {
      errors.push(`${clip.name}: End time must be greater than start time`);
    }
    if (clip.audioBuffer && clip.endTime > clip.duration) {
      errors.push(`${clip.name}: End time exceeds audio duration (${clip.duration.toFixed(2)}s)`);
    }
    if (orders.has(clip.order)) {
      errors.push(`Duplicate order value: ${clip.order}`);
    }
    orders.add(clip.order);
  }

  return errors;
}



export async function createMixBuffer(clips: AudioClip[]): Promise<AudioBuffer> {
  // Sort by order
  const sortedClips = [...clips].sort((a, b) => a.order - b.order);

  // Trim each clip
  const trimmedBuffers: AudioBuffer[] = [];
  for (const clip of sortedClips) {
    if (!clip.audioBuffer) {
      throw new Error(`Audio buffer not loaded for ${clip.name}`);
    }
    const trimmed = trimAudioBuffer(clip.audioBuffer, clip.startTime, clip.endTime);
    trimmedBuffers.push(trimmed);
  }

  // Concatenate all trimmed buffers
  return concatenateAudioBuffers(trimmedBuffers);
}

export async function generateMix(clips: AudioClip[]): Promise<Blob> {
  const finalBuffer = await createMixBuffer(clips);
  // Convert to WAV
  return audioBufferToWav(finalBuffer);
}

export async function audioBufferToMp3(
  audioBuffer: AudioBuffer,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;

  // Get channel data and convert to Int16
  const leftChannel = audioBuffer.getChannelData(0);
  const rightChannel = channels > 1 ? audioBuffer.getChannelData(1) : leftChannel; // Use left for right if mono

  // Convert float32 to int16
  const left = new Int16Array(leftChannel.length);
  const right = new Int16Array(rightChannel.length);

  for (let i = 0; i < leftChannel.length; i++) {
    left[i] = Math.max(-1, Math.min(1, leftChannel[i])) * (leftChannel[i] < 0 ? 0x8000 : 0x7FFF);
  }

  if (channels > 1) {
    for (let i = 0; i < rightChannel.length; i++) {
      right[i] = Math.max(-1, Math.min(1, rightChannel[i])) * (rightChannel[i] < 0 ? 0x8000 : 0x7FFF);
    }
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./mp3.worker.ts', import.meta.url), {
      type: 'module'
    });

    worker.onmessage = (e) => {
      if (e.data.error) {
        reject(new Error(e.data.error));
        worker.terminate();
      } else if (e.data.progress !== undefined) {
        if (onProgress) {
          onProgress(e.data.progress);
        }
      } else {
        const { mp3Data } = e.data;
        resolve(new Blob(mp3Data as unknown as BlobPart[], { type: 'audio/mp3' }));
        worker.terminate();
      }
    };

    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };

    worker.postMessage({
      channels,
      sampleRate,
      left,
      right: channels > 1 ? right : undefined
    }, [left.buffer, right.buffer]); // Transferables
  });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}
