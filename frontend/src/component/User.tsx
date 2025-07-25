import { useEffect, useRef, useState } from "react";

function User() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [started, setStarted] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const roomidRef = useRef<string | null>(null);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setStarted(true);
    } catch (e: any) {
      console.error("Camera error:", e);
      alert("Camera error: " + e.message);
    }
  };

  useEffect(() => {
    if (!started) return;

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    setSocket(ws);

    ws.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);
      const pc = pcRef.current;

      if (data.type === "ownership") {
        roomidRef.current = data.Roomid;
        if (data.data === "sender") {
          await handelSender(ws);
        } else if (data.data === "reciever") {
          await handelReceiver(ws);
        }
        return;
      }

      if (!pc) return;

      if (data.type === "createoffer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.data));
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: "createanswer", Roomid: roomidRef.current, data: answer }));
      }

      if (data.type === "createanswer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.data));
      }

      if (data.type === "icecandidate") {
        await pc.addIceCandidate(data.data);
      }

      if (data.type === "nextuser") {
        if (pc) pc.close();
        pcRef.current = null;
        roomidRef.current = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      }
    };

    return () => {
      ws.close();
    };
  }, [started]);

  async function handelSender(sock: WebSocket) {
    const pc = new RTCPeerConnection();
    pcRef.current = pc;
    const remoteStream = new MediaStream();

    pc.ontrack = (event) => {
      remoteStream.addTrack(event.track);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sock.send(JSON.stringify({ type: "createoffer", Roomid: roomidRef.current, data: offer }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sock.send(JSON.stringify({ type: "icecandidate", Roomid: roomidRef.current, data: event.candidate }));
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  }

  async function handelReceiver(sock: WebSocket) {
    const pc = new RTCPeerConnection();
    pcRef.current = pc;
    const remoteStream = new MediaStream();

    pc.ontrack = (event) => {
      remoteStream.addTrack(event.track);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sock.send(JSON.stringify({ type: "icecandidate", Roomid: roomidRef.current, data: event.candidate }));
      }
    };
  }

  function nextuser() {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    socket?.send(JSON.stringify({ type: 'nextuser', Roomid: roomidRef.current }));
    roomidRef.current = null;
  }

  return (
    <div>
      <div>
        <video ref={localVideoRef} autoPlay muted playsInline width={400} style={{ transform: 'scaleX(-1)' }} />
        <p>Local Video</p>
      </div>

      <div>
        <video ref={remoteVideoRef} autoPlay playsInline width={400} style={{ transform: 'scaleX(-1)' }} />
        <p>Remote Video</p>
      </div>

      {!started ? (
        <button onClick={startVideo}>Start</button>
      ) : (
        <button onClick={nextuser}>Next</button>
      )}
    </div>
  );
}

export default User;
