import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import { Roommanager } from "./Roommanager";

const wss = new WebSocketServer({ port: 8080 });
console.log("backend is up");

let i = 1;
const manager = new Roommanager();

wss.on('connection', (socket: WebSocket) => {
  console.log(`${i} user join`);
  i++;
  manager.adduser(socket, null);

  socket.on('error', (error) => {
    console.log("WebSocket error:", error);
  });

  socket.on('close', () => {
    console.log("someone dissconect")
    i--;
    console.log("now the total number of active users: "+(i-1));
    manager.removeuser(socket);
  });

  socket.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(message.type);
      if (message.type === 'nextuser') {
        console.log("reach to index.js");
        manager.nextuser(socket, message);
      } else {
        manager.handelmessage(socket, message);
      }
    } catch (err) {
      console.error("Invalid JSON:", err);
    }
  });
});
