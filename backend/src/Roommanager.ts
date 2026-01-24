  import { WebSocket } from "ws";
  import { call } from "./call";
  import {  v4 as uuidv4 } from 'uuid';

  export class Roommanager {
    private pendinguser: WebSocket[] = [];
    map = new Map();
    private blockedConnections: Map<WebSocket, Set<WebSocket>> = new Map();
    
    constructor() {}
    
    adduser(socket: WebSocket, previous: WebSocket | null) {
      if (this.pendinguser.length === 0) {
        this.pendinguser.push(socket);
      } else {
        if (previous) {
          const index = this.pendinguser.findIndex(ws => {
            // Don't match with previous or self
            if (ws === previous || ws === socket) return false;
            // Check if they are blocked from each other
            const blocked = this.blockedConnections.get(socket);
            if (blocked && blocked.has(ws)) return false;
            return true;
          });
          
          if (index !== -1) {
            const reciever = this.pendinguser[index];
            this.pendinguser.splice(index, 1); 
            const id = uuidv4();
            const cal = new call(socket, reciever, id);
            this.map.set(id, { call: cal, socket1: socket, socket2: reciever });
          } else {
            this.pendinguser.push(socket);
          }
        } else {
          // Find first user that is not blocked with current socket
          let matchedIndex = -1;
          for (let i = this.pendinguser.length - 1; i >= 0; i--) {
            const ws = this.pendinguser[i];
            if (ws === socket) continue;
            
            // Check if they are blocked from each other
            const blocked = this.blockedConnections.get(socket);
            if (blocked && blocked.has(ws)) continue;
            
            matchedIndex = i;
            break;
          }
          
          if (matchedIndex !== -1) {
            const prev = this.pendinguser[matchedIndex];
            this.pendinguser.splice(matchedIndex, 1);
            const id = uuidv4();
            const cal = new call(socket, prev, id);
            this.map.set(id, { call: cal, socket1: socket, socket2: prev });
          } else {
            this.pendinguser.push(socket);
          }
        }
      }
    }

    handelmessage(socket: WebSocket, data: any) {
      this.map.get(data.Roomid)?.call.message(socket, data);
    }

    nextuser(socket: WebSocket, data: any) {
      console.log("hello from the next function");
      const room = this.map.get(data.Roomid);
      if (!room) {
        console.warn("Room not found or already handled:", data.Roomid);
        return;
      }

      room.call.message(socket, data);

      const u1 = room.socket1;
      const u2 = room.socket2;

      this.map.delete(data.Roomid);
      
      // Block u1 and u2 from connecting to each other
      if (!this.blockedConnections.has(u1)) {
        this.blockedConnections.set(u1, new Set());
      }
      this.blockedConnections.get(u1)!.add(u2);
      
      if (!this.blockedConnections.has(u2)) {
        this.blockedConnections.set(u2, new Set());
      }
      this.blockedConnections.get(u2)!.add(u1);
      
      console.log("got user");

      this.adduser(u1, u2);
      this.adduser(u2, u1);

      console.log(this.map.size);
      console.log(this.pendinguser.length);
      console.log("new connection made");
    }

    removeuser(socket: WebSocket) {
      const index = this.pendinguser.indexOf(socket);
      if (index !== -1) {
        this.pendinguser.splice(index, 1);
        return;
      }
      for (const [roomId, room] of this.map.entries()) {
        if (room.socket1 === socket || room.socket2 === socket) {
          const otherSocket = room.socket1 === socket ? room.socket2 : room.socket1;
          const data = { type: "deleteuser" };
          room.call.message(otherSocket, data);
          this.map.delete(roomId);
          
          // Block these two from reconnecting
          if (!this.blockedConnections.has(otherSocket)) {
            this.blockedConnections.set(otherSocket, new Set());
          }
          this.blockedConnections.get(otherSocket)!.add(socket);
          
          if (!this.blockedConnections.has(socket)) {
            this.blockedConnections.set(socket, new Set());
          }
          this.blockedConnections.get(socket)!.add(otherSocket);
          
          // Pass the disconnected socket as "previous" to prevent reconnection
          this.adduser(otherSocket, socket);
          break;
        }
      }
    }
  }
