import { WebSocket } from "ws";

export class call{
    private sender:WebSocket;
    private reciever:WebSocket;
    private id:string;
    constructor(sender:WebSocket,reciever:WebSocket,id:string){
        this.sender=sender;
        this.reciever=reciever;
        this.id=id;
        this.makecall(sender,reciever);
    }
    private makecall(sender:WebSocket,reciever:WebSocket){
        sender.send(JSON.stringify({type:'ownership',Roomid:this.id,data:'sender'}));
        reciever.send(JSON.stringify({type:'ownership',Roomid:this.id,data:'receiver'}));
        console.log("sender and receiver is created");
    }
    message(socket:WebSocket,data:any){
       console.log("Message type:", data.type);
       if(socket===this.sender){
         if(data.type==='createoffer'){
          console.log("Relaying createoffer from sender to receiver");
          this.reciever.send(JSON.stringify({type:'createoffer',data:data.data}));
         }
         else if(data.type==='icecandidate'){
          console.log("Relaying ICE candidate from sender to receiver");
          this.reciever.send(JSON.stringify({type:'icecandidate',data:data.data}));
         }
         else if(data.type==='chat'){
          console.log("Relaying chat message from sender to receiver");
          this.reciever.send(JSON.stringify({type:'chat',message:data.message}));
         }
         else if(data.type==='nextuser'){
            console.log("Nextuser request from sender");
            this.reciever.send(JSON.stringify({type:'nextuser'}));
            this.sender.send(JSON.stringify({type:'nextuser'}));
         }
         else if(data.type==='deleteuser'){
            console.log("User deleted from sender");
            this.reciever.send(JSON.stringify({type:'deleteuser'}));
         }
       }else{
        if(data.type==='createanswer'){
            console.log("Relaying createanswer from receiver to sender");
            this.sender.send(JSON.stringify({type:'createanswer',data:data.data}));
        }
        else if(data.type==='icecandidate'){
            console.log("Relaying ICE candidate from receiver to sender");
            this.sender.send(JSON.stringify({type:'icecandidate',data:data.data}));
        }
        else if(data.type==='chat'){
          console.log("Relaying chat message from receiver to sender");
          this.sender.send(JSON.stringify({type:'chat',message:data.message}));
        }
        else if(data.type=='nextuser'){
            console.log("Nextuser request from receiver");
            this.reciever.send(JSON.stringify({type:'nextuser'}));
            this.sender.send(JSON.stringify({type:'nextuser'}));
        }
        else if(data.type==='deleteuser'){
            console.log("User deleted from receiver");
            this.sender.send(JSON.stringify({type:'deleteuser'}));
        }
       }
    }

}