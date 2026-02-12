# VibeNet

Real-time video/audio chat with room management and optional recording — a minimal WebRTC signaling + React frontend demo.

This repository contains a TypeScript Node.js backend (signaling and session management) and a React + Vite frontend for live video calls.

## Key Features
- Real-time peer-to-peer video using WebRTC
- Signaling server to create/join rooms and exchange offers/answers
- Basic room management and messaging
- Frontend hooks for WebRTC and WebSocket integration
- Optional recording/transcription extension points

## Tech Stack
- Frontend: React (TypeScript), Vite, Tailwind (in repo)
- Backend: Node.js (TypeScript)
- Real-time: WebRTC (peer-to-peer) + WebSocket signaling
- Optional AI/Processing: can integrate OpenAI for post-call feedback or transcription

## Repo Layout (important files)
- backend/: Node backend
  - src/index.ts — server entry (HTTP & WebSocket signalling)
  - src/call.ts — WebRTC signaling helpers
  - src/Roommanager.ts — room lifecycle manager
  - src/message.ts — message shapes/handlers
- frontend/: React app with components and hooks
  - src/components/VideoCall.tsx — call UI
  - src/hooks/useWebRTC.ts — WebRTC helper hook
  - src/hooks/useWebSocket.ts — WebSocket helper hook

## Environment (example)
Create a `.env` in `backend/` with the values below for local development.

```
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=changeme
DATABASE_URL=sqlite://./dev.db # optional
```

If adding recording uploads:

```
S3_BUCKET=your-bucket
S3_KEY=AKIA...
S3_SECRET=...
```

## API / Signaling Endpoints (high level)
- `POST /` or WebSocket connect — signaling socket for offer/answer/ice exchange
- Backend manages simple JSON messages: `join`, `leave`, `offer`, `answer`, `ice`, `message`
- `GET /health` — health check

Typical signaling message shape (JSON):
```
{ type: 'join'|'offer'|'answer'|'ice'|'message', roomId, payload }
```

## Local Development

Backend
```bash
cd backend
npm install
# copy .env.example -> .env and edit
npm run dev
```

Frontend
```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

The repo includes `docker-compose.yml` for a quick containerized run of both services.

## Running with Docker (quick)

```bash
docker-compose up --build
```

## Data model (conceptual)
- User { id, name, email }
- Room { id, hostId, participants[], createdAt }
- Message { id, roomId, senderId, type, payload, createdAt }
- Recording { id, roomId, url, createdAt }

## Testing
- Unit test WebRTC helpers by mocking RTCPeerConnection and message flows
- Integration test signaling flows using local WebSocket clients
- E2E: simulate two browser clients connecting and exchanging media

## Security & Privacy
- Use HTTPS in production and secure WebSocket (wss)
- Validate and sanitize incoming signaling messages
- If storing recordings/transcripts, encrypt at rest and provide deletion controls

## Deployment notes
- Host backend as a container or Node service behind HTTPS
- Frontend deployable to Vercel/Netlify; configure `FRONTEND_URL` and CORS
- For production TURN servers are required for reliable NAT traversal — consider coturn or a managed TURN provider

## Extending (ideas)
- Add recording upload + transcription + AI-based feedback
- Persistent user accounts & history of sessions
- Interview mode: scripted questions + LLM evaluation (see example AI Interviewer project)

## Where to look first
- Backend entry: [backend/src/index.ts](backend/src/index.ts)
- Room logic: [backend/src/Roommanager.ts](backend/src/Roommanager.ts)
- Frontend call UI: [frontend/src/components/VideoCall.tsx](frontend/src/components/VideoCall.tsx)

---

If you want, I can commit this `README.md` to the repo, or expand any section (API details, example signaling payloads, or add a `.env.example`) — which would you prefer next?
# VibeNet

Simple WebRTC/video chat demo with a lightweight WebSocket backend.

## Features
- One-to-one video chat UI (frontend built with Vite + React).
- Lightweight WebSocket room manager (backend in TypeScript).
- Persists the selected camera across sessions (stored in localStorage key `vibenet.selectedCamera`).

## Quickstart — Local development

Backend

```bash
cd backend
npm install
npm run dev
```

Frontend

```bash
cd frontend
npm install
npm run dev
```

Notes:
- The backend WebSocket server listens on port `8081` by default (see [backend/src/index.ts](backend/src/index.ts#L1-L40)).
- The frontend dev server uses Vite (default port may be `5173`); the app can also be built and served via Docker (see below).

## Docker (build and run)

Build and start both services using Docker Compose from the repo root:

```bash
docker compose build
docker compose up
```

Services exposed by the compose file:
- Frontend: `http://localhost:3000` (nginx serves the built Vite app)
- Backend WS server: `ws://localhost:8081`

Files of interest
- [backend/Dockerfile](backend/Dockerfile)
- [frontend/Dockerfile](frontend/Dockerfile)
- [docker-compose.yml](docker-compose.yml)
- [backend/src/index.ts](backend/src/index.ts#L1-L120)
- [frontend/src/components/LocalPreview.tsx](frontend/src/components/LocalPreview.tsx#L1-L200) — where the selected camera is persisted/restored

Troubleshooting
- If the frontend dev server fails to start, ensure Node 18+ is installed and that dependencies are installed.
- If the browser blocks getUserMedia, verify site permissions and try a different browser/profile.

Next improvements (ideas)
- Add a device selector UI so users can choose camera/microphone manually before joining.
- Add environment variable support for ports and CORS policies in production.

If you want, I can add a small camera/device selector UI or update the compose file for custom ports.
