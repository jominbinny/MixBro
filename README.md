# MixBro

MixBro is a web-based audio mixing tool that allows users to upload multiple audio files, define specific start and end timestamps for each file, set the order of usage, and generate a single stitched dance audio track.

---

## Overview

MixBro is designed for creating custom dance mixes by combining selected portions of multiple audio tracks. Users upload their own audio files, specify which segments to use, and MixBro processes these segments on the backend to produce one continuous output audio file.

The application works **only with user-uploaded audio** and does not fetch, stream, or extract audio from external platforms such as YouTube or other third-party sources.

---

## Features

- Upload multiple audio files (`.mp3` or `.wav`)
- Define start and end timestamps for each audio file
- Specify the order in which audio segments should be played
- Backend trimming of audio segments using FFmpeg
- Concatenation of trimmed segments into a single output file
- Download and playback of the final mixed audio

---

## Tech Stack

### Frontend
- HTML
- CSS
- Vanilla JavaScript
- HTML5 Audio element

### Backend
- Node.js
- Express.js
- Multer (file uploads)

### Audio Processing
- FFmpeg

---

## Project Structure

```
mixbro/
│
├── uploads/
│   ├── original/    # Original uploaded audio files
│   ├── trimmed/     # Trimmed audio segments
│   └── final/       # Final stitched output
│
├── routes/          # Express routes
├── controllers/     # Request handling logic
├── utils/
│   └── ffmpeg.js    # FFmpeg processing utilities
│
├── server.js        # Express server entry point
├── index.html       # Frontend UI
├── style.css        # Basic styling
└── script.js        # Frontend logic
```

---

## How It Works

1. The user uploads multiple audio files.
2. For each file, the user specifies:
   - Start time (in seconds)
   - End time (in seconds)
   - Order of appearance in the final mix
3. The backend validates the inputs.
4. Each audio file is trimmed using FFmpeg based on the provided timestamps.
5. The trimmed audio segments are concatenated in the specified order.
6. A single final audio file is generated and sent back to the user.
7. Temporary files are deleted after processing.

---

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher recommended)
- FFmpeg installed and accessible from the command line

---

### Installing FFmpeg

#### Linux
```bash
sudo apt update
sudo apt install ffmpeg
```

#### macOS (using Homebrew)
```bash
brew install ffmpeg
```

#### Windows
1. Download FFmpeg from the official website.
2. Extract the files.
3. Add the `bin` directory to your system PATH.
4. Verify installation:
```bash
ffmpeg -version
```

---

### Running the Project

1. Clone the repository.
2. Navigate to the project directory.
3. Install dependencies:
```bash
npm install
```
4. Start the server:
```bash
node server.js
```
5. Open `index.html` in your browser.

---

## Usage Instructions

1. Upload one or more audio files.
2. Enter start and end timestamps (in seconds) for each file.
3. Assign a unique order number to each audio segment.
4. Click **Generate Mix**.
5. Download or play the generated final audio track.

---

## Input Rules & Validation

- Supported formats: `.mp3`, `.wav`
- Start time must be less than end time
- Timestamps must be within the audio duration
- Each audio segment must have a unique order value

Invalid inputs are rejected with appropriate error messages.

---

## Limitations

- No waveform visualization
- No drag-and-drop timeline
- No real-time editing
- Local filesystem storage only
- No cloud deployment or streaming support

---

## Legal & Copyright Notice

Users are responsible for ensuring they own or have the legal rights to use any audio files uploaded to MixBro.  
MixBro does not provide, fetch, extract, or redistribute copyrighted content from external platforms.

---

## Author

Developed as a focused audio-processing web project.
