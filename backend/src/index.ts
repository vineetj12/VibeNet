import WebSocket, { WebSocketServer } from "ws";
import { Roommanager } from "./Roommanager";
import * as http from "http";

// Create HTTP server to handle upgrades properly and provide a health endpoint
const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ 
  server,
  perMessageDeflate: false 
});

const PORT = Number(process.env.PORT) || 8080;

let i = 1;
const manager = new Roommanager();

wss.on('connection', (socket: WebSocket) => {
  console.log(`✅ ${i} user join`);
  i++;
  manager.adduser(socket, null);

  socket.on('error', (error) => {
    console.log("WebSocket error:", error);
  });

  socket.on('close', () => {
    console.log("User disconnected")
    i--;
    console.log("Active users: " + (i-1));
    manager.removeuser(socket);
  });

  socket.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("Message received:", message.type, "Roomid:", message.Roomid);
      if (message.type === 'nextuser') {
        console.log("Nextuser request");
        manager.nextuser(socket, message);
      } else {
        console.log("Routing message:", message.type);
        manager.handelmessage(socket, message);
      }
    } catch (err) {
      console.error("Invalid JSON:", err);
    }
  });

  // Send a heartbeat to keep connection alive
  socket.send(JSON.stringify({ type: 'connected', message: 'You are connected to the server' }));
});

// Periodically send pings to all connected clients
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  });
}, 30000);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`WebSocket server listening on ws://0.0.0.0:${PORT}`);
  console.log("Accepting connections from all interfaces");
});
