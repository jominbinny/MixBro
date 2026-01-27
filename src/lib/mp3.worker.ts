// @ts-ignore
import lamejs from './lamejs-bundled';

self.onmessage = (e: MessageEvent) => {
    const { channels, sampleRate, left, right } = e.data;

    try {
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128); // 128kbps
        const mp3Data: Int8Array[] = [];
        const sampleBlockSize = 1152; // multiple of 576

        // Encode
        for (let i = 0; i < left.length; i += sampleBlockSize) {
            const leftChunk = left.subarray(i, i + sampleBlockSize);
            const rightChunk = right ? right.subarray(i, i + sampleBlockSize) : undefined;

            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
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
