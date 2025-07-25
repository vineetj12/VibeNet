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
        reciever.send(JSON.stringify({type:'ownership',Roomid:this.id,data:'reciever'}));
        console.log("sender and reciever is created");
    }
    message(socket:WebSocket,data:any){
       if(socket===this.sender){
         if(data.type==='createoffer'){
          this.reciever.send(JSON.stringify({type:'createoffer',data:data.data}));
         }
         else if(data.type==='icecandidate'){
          this.reciever.send(JSON.stringify({type:'icecandidate',data:data.data}));
         }
         else if(data.type==='nextuser'){
            this.reciever.send(JSON.stringify({type:'nextuser'}));
            this.sender.send(JSON.stringify({type:'nextuser'}));
         }
       }else{
        if(data.type==='createanswer'){
            this.sender.send(JSON.stringify({type:'createanswer',data:data.data}));
        }
        else if(data.type==='icecandidate'){
        this.sender.send(JSON.stringify({type:'icecandidate',data:data.data}));
        }
        else if(data.type=='nextuser'){
            this.reciever.send(JSON.stringify({type:'nextuser'}));
            this.sender.send(JSON.stringify({type:'nextuser'}));
        }
       }
    }

}