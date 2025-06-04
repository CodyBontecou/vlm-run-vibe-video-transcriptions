# VLM Video Transcription App

A Nuxt.js application for transcribing videos using VLM Run's video transcription API.

## Features

- Drag and drop video upload
- Real-time transcription status updates
- Clean, responsive UI with Shadcn-vue and Tailwind CSS
- TypeScript support with Composition API

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your VLM Run API key to the `.env` file:
   ```
   VLMRUN_API_KEY=your_api_key_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Drag and drop a video file (MP4, MOV, AVI, or WebM) into the upload area
2. Click "Transcribe Video" to start the transcription process
3. The transcription will appear in the right column when complete

## Tech Stack

- **Framework**: Nuxt 3 with TypeScript
- **UI Components**: Shadcn-vue
- **Styling**: Tailwind CSS
- **Video Transcription**: VLM Run API
- **Form Handling**: Formidable

## API Endpoints

- `POST /api/transcribe` - Submit a video for transcription
- `POST /api/transcription-callback` - Webhook endpoint for VLM Run callbacks
- `GET /api/transcription-status/:jobId` - Check transcription status

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.