# VibeNet - Video Chat Application

A real-time peer-to-peer video chat application that connects random users for spontaneous video conversations.

## Features

- Real-time peer-to-peer video calls using WebRTC
- WebSocket-based signaling
- Text chat during video calls
- Random user matching
- Responsive UI with mobile support

## Technologies Used

- **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn-ui
- **Backend**: Node.js, WebSocket (ws), Express
- **Real-time Communication**: WebRTC, WebSocket

## Getting Started

### Prerequisites

- Node.js & npm installed

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to frontend directory
cd vibenet-connect-main
npm install

# In another terminal, navigate to backend directory
cd ../backend
npm install
```

### Running the Application

**Frontend (runs on port 8080):**
```sh
cd vibenet-connect-main
npm run dev
```

**Backend (runs on port 8081):**
```sh
cd backend
npm run dev
```

Open http://localhost:8080 in your browser.

## Project Structure

```
VibeNet/
├── vibenet-connect-main/     # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   └── App.tsx          # Main App component
│   └── package.json
└── backend/                  # Node.js WebSocket server
    ├── src/
    │   ├── index.ts         # Main server file
    │   ├── Roommanager.ts   # Room management
    │   └── call.ts          # Call handling
    └── package.json
```
