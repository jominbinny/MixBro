// @ts-ignore
importScripts('/lamejs.js');

self.onmessage = (e: MessageEvent) => {
    const { channels, sampleRate, left, right } = e.data;

    try {
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128); // 128kbps
        const mp3Data: Int8Array[] = [];
        // Process ~1 second of audio per chunk to reduce loop overhead (1152 * 40 samples)
        const batchSize = 1152 * 40;

        // Encode
        for (let i = 0; i < left.length; i += batchSize) {
            const leftChunk = left.subarray(i, i + batchSize);
            const rightChunk = right ? right.subarray(i, i + batchSize) : undefined;

            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }

            // Report progress every loop for large batches
            // (since batchSize is large enough, we don't need to throttle much more, 
            // but let's just reporting every time is fine as it's ~1 sec)
            const progress = Math.round((i / left.length) * 100);
            self.postMessage({ progress });
        }

        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }

        self.postMessage({ mp3Data });
    } catch (error) {
        self.postMessage({ error: String(error) });
    }
};
