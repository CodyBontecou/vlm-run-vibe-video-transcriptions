# VLM Video Transcription App

A web application for transcribing videos using VLM Run's AI-powered transcription service.

## Features

- **Bring Your Own Key**: Use your own VLM Run API key stored securely in browser local storage
- **Video Upload**: Drag & drop or click to upload video files (MP4, MOV, AVI, WebM)
- **Real-time Transcription**: Get accurate transcriptions powered by VLM Run
- **Transcription History**: View and manage all your past transcriptions
- **Webhook Support**: Efficient webhook-based status updates  
- **Responsive Design**: Works great on desktop and mobile devices
- **TypeScript Support**: Full TypeScript support with Vue 3 Composition API

## Getting Started

### 1. Get a VLM Run API Key

Visit [https://vlm.run](https://vlm.run) to sign up and get your API key.

### 2. Run Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 3. Enter Your API Key

When you first open the app, you'll be prompted to enter your VLM Run API key. This key is stored securely in your browser's local storage and never sent to our servers.

## Usage

1. Enter your VLM Run API key when prompted
2. Upload a video file by dragging it into the upload area or clicking to browse
3. Click "Transcribe Video" to start the transcription
4. View your transcription results and history
5. Click on any past transcription to view its details

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fvlm-vibe-code)

Or deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Environment Variables (Optional)

If you want to use a custom callback URL for webhooks (e.g., with ngrok during development):

```env
CALLBACK_BASE_URL=https://your-ngrok-id.ngrok.io
```

## Tech Stack

- **Frontend**: Vue 3 + Nuxt 3
- **Styling**: Tailwind CSS  
- **Backend**: Nitro server
- **API**: VLM Run transcription service
- **Storage**: Browser localStorage for API keys, server file storage for transcription history

## Development

```bash
# Type check
npm run type-check

# Build
npm run build

# Preview production build
npm run preview
```

## API Endpoints

- `POST /api/transcribe` - Submit a video for transcription
- `GET /api/transcriptions` - Get transcription history
- `GET /api/transcription/:jobId` - Get specific transcription details
- `POST /api/transcription-callback` - Webhook endpoint for VLM Run callbacks

## License

MIT