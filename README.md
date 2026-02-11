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
