"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.call = void 0;
class call {
    constructor(sender, reciever, id) {
        this.sender = sender;
        this.reciever = reciever;
        this.id = id;
        this.makecall(sender, reciever);
    }
    makecall(sender, reciever) {
        sender.send(JSON.stringify({ type: 'ownership', Roomid: this.id, data: 'sender' }));
        reciever.send(JSON.stringify({ type: 'ownership', Roomid: this.id, data: 'reciever' }));
        console.log("sender and reciever is created");
    }
    message(socket, data) {
        if (socket === this.sender) {
            if (data.type === 'createoffer') {
                this.reciever.send(JSON.stringify({ type: 'createoffer', data: data.data }));
            }
            else if (data.type === 'icecandidate') {
                this.reciever.send(JSON.stringify({ type: 'icecandidate', data: data.data }));
            }
            else if (data.type === 'nextuser') {
                this.reciever.send(JSON.stringify({ type: 'nextuser' }));
                this.sender.send(JSON.stringify({ type: 'nextuser' }));
            }
        }
        else {
            if (data.type === 'createanswer') {
                this.sender.send(JSON.stringify({ type: 'createanswer', data: data.data }));
            }
            else if (data.type === 'icecandidate') {
                this.sender.send(JSON.stringify({ type: 'icecandidate', data: data.data }));
            }
            else if (data.type == 'nextuser') {
                this.reciever.send(JSON.stringify({ type: 'nextuser' }));
                this.sender.send(JSON.stringify({ type: 'nextuser' }));
            }
        }
    }
}
exports.call = call;
