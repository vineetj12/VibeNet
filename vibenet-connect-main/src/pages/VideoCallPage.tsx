import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import VideoCall from "@/components/VideoCall";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import { toast } from "sonner";

const VideoCallPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const nickname = location.state?.nickname || "Anonymous";
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remoteUserName, setRemoteUserName] = useState<string | undefined>();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [role, setRole] = useState<"sender" | "receiver" | null>(null);
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    isOwn: boolean;
    timestamp: Date;
  }>>([]); // Start with empty messages

  const {
    remoteStream,
    addLocalStreamToPeer,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    cleanup: cleanupWebRTC,
    peerConnection,
  } = useWebRTC({
    onError: (error) => {
      console.error("❌ WebRTC error:", error);
      toast.error("WebRTC error: " + error);
    },
  });

  const handleConnect = useCallback(() => {
    console.log("Connected to backend");
    setIsLoading(true);
    toast.info("Waiting for someone to connect...");
  }, []);

  const handleMessage = useCallback(
    async (data: any) => {
      console.log("Message from backend:", data);

      if (data.type === "ownership") {
        // Matched with someone!
        console.log("Matched! Room:", data.Roomid, "Role:", data.data);
        setRoomId(data.Roomid);
        setRole(data.data);
        setIsLoading(false);
        setIsConnected(true);
        setRemoteUserName(`Stranger-${data.Roomid.slice(0, 6)}`);
        toast.success("Connected with someone!");

        // Setup WebRTC
        await addLocalStreamToPeer();

        // If we're the sender (initiator), create offer
        if (data.data === "sender") {
          const offer = await createOffer();
          if (offer) {
            console.log("Sending createoffer");
            sendWebSocket({
              type: "createoffer",
              Roomid: data.Roomid,
              data: offer,
            });
          }
        }
      } else if (data.type === "createoffer") {
        // Received offer from sender
        console.log("Received createoffer");
        await setRemoteDescription(data.data);

        // Create answer
        const answer = await createAnswer();
        if (answer) {
          console.log("Sending createanswer");
          sendWebSocket({
            type: "createanswer",
            Roomid: roomId,
            data: answer,
          });
        }
      } else if (data.type === "createanswer") {
        // Received answer from receiver
        console.log("Received createanswer");
        await setRemoteDescription(data.data);
      } else if (data.type === "icecandidate") {
        // Received ICE candidate
        console.log("Received ICE candidate");
        await addIceCandidate(data.data);
      } else if (data.type === "chat") {
        // Received chat message
        console.log("Received chat message:", data.message);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: data.message,
            isOwn: false,
            timestamp: new Date(),
          },
        ]);
      } else if (data.type === "nextuser") {
        // Next user request
        console.log("Moving to next user");
        setIsLoading(true);
        setIsConnected(false);
        setRemoteUserName(undefined);
        setMessages([]);
        cleanupWebRTC();
        toast.info("Finding someone new...");
      }
    },
    [addLocalStreamToPeer, createOffer, createAnswer, setRemoteDescription, addIceCandidate, cleanupWebRTC, roomId]
  );

  const handleDisconnect = useCallback(() => {
    console.log("Disconnected from backend");
    setIsConnected(false);
    setIsLoading(false);
    setRoomId(null);
    cleanupWebRTC();
    toast.error("Disconnected from server");
  }, [cleanupWebRTC]);

  const handleError = useCallback(
    (error: Event) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
      setIsLoading(false);
      setRoomId(null);
      cleanupWebRTC();
      toast.error("Connection error - Attempting to reconnect...");
    },
    [cleanupWebRTC]
  );

  // Connect to WebSocket backend
  const { send: sendWebSocket, isConnected: wsConnected } = useWebSocket({
    url: "ws://localhost:8081",
    onConnect: handleConnect,
    onMessage: handleMessage,
    onDisconnect: handleDisconnect,
    onError: handleError,
  });

  // Setup ICE candidate listener
  useEffect(() => {
    if (!peerConnection) return;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate");
        sendWebSocket({
          type: "icecandidate",
          Roomid: roomId,
          data: event.candidate,
        });
      }
    };
  }, [peerConnection, roomId, sendWebSocket]);

  const handleEndCall = () => {
    cleanupWebRTC();
    toast.info("Call ended");
    navigate("/lobby", { state: { nickname } });
  };

  const handleNextUser = () => {
    if (roomId) {
      console.log("Sending nextuser request");
      sendWebSocket({ type: "nextuser", Roomid: roomId });
    }
  };

  const handleSendMessage = useCallback((text: string) => {
    // Add message to local state
    const newMessage = {
      id: Date.now().toString(),
      text,
      isOwn: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // Send chat message through WebSocket
    if (roomId) {
      console.log("Sending chat message:", text);
      sendWebSocket({
        type: "chat",
        Roomid: roomId,
        message: text,
      });
    }
  }, [roomId, sendWebSocket]);

  return (
    <VideoCall
      isConnected={isConnected}
      isLoading={isLoading}
      remoteUserName={remoteUserName}
      remoteStream={remoteStream}
      onEndCall={handleEndCall}
      onNextUser={handleNextUser}
      messages={messages}
      onSendMessage={handleSendMessage}
    />
  );
};

export default VideoCallPage;
