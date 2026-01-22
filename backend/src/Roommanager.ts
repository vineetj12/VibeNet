  import { WebSocket } from "ws";
  import { call } from "./call";
  import {  v4 as uuidv4 } from 'uuid';

  export class Roommanager {
    private pendinguser: WebSocket[] = [];
    map = new Map();
    constructor() {}
    adduser(socket: WebSocket, previous: WebSocket | null) {
      if (this.pendinguser.length === 0) {
        this.pendinguser.push(socket);
      } else {
        if (previous) {
          const index = this.pendinguser.findIndex(ws => ws !== previous && ws !== socket);
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
          const prev = this.pendinguser.pop();
          if (prev) {
            const id = uuidv4();
            const cal = new call(socket, prev, id);
            this.map.set(id, { call: cal, socket1: socket, socket2: prev });
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
          this.adduser(otherSocket, socket);
          break;
        }
      }
    }
  }
