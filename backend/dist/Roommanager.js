"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roommanager = void 0;
const call_1 = require("./call");
const uuid_1 = require("uuid");
class Roommanager {
    constructor() {
        this.pendinguser = [];
        this.map = new Map();
    }
    adduser(socket, previous) {
        if (this.pendinguser.length === 0) {
            this.pendinguser.push(socket);
        }
        else {
            if (previous) {
                const index = this.pendinguser.findIndex(ws => ws !== previous && ws !== socket);
                if (index !== -1) {
                    const reciever = this.pendinguser[index];
                    this.pendinguser.splice(index, 1); // ✅ remove receiver
                    const id = (0, uuid_1.v4)();
                    const cal = new call_1.call(socket, reciever, id);
                    this.map.set(id, { call: cal, socket1: socket, socket2: reciever });
                }
                else {
                    this.pendinguser.push(socket);
                }
            }
            else {
                const prev = this.pendinguser.pop();
                if (prev) {
                    const id = (0, uuid_1.v4)();
                    const cal = new call_1.call(socket, prev, id);
                    this.map.set(id, { call: cal, socket1: socket, socket2: prev });
                }
            }
        }
    }
    handelmessage(socket, data) {
        var _a;
        (_a = this.map.get(data.Roomid)) === null || _a === void 0 ? void 0 : _a.call.message(socket, data);
    }
    nextuser(socket, data) {
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
    removeuser(socket) {
        this.pendinguser = this.pendinguser.filter(ws => ws !== socket);
    }
}
exports.Roommanager = Roommanager;
