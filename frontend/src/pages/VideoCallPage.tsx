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
      toast.error("WebRTC error: " + error);
    },
  });

  const handleConnect = useCallback(() => {
    setIsLoading(true);
    toast.info("Waiting for someone to connect...");
  }, []);

  const handleMessage = useCallback(
    async (data: any) => {
      if (data.type === "ownership") {
        // Matched with someone!
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
            sendWebSocket({
              type: "createoffer",
              Roomid: data.Roomid,
              data: offer,
            });
          }
        }
      } else if (data.type === "createoffer") {
        // Received offer from sender
        await setRemoteDescription(data.data);

        // Create answer
        const answer = await createAnswer();
        if (answer) {
          sendWebSocket({
            type: "createanswer",
            Roomid: roomId,
            data: answer,
          });
        }
      } else if (data.type === "createanswer") {
        // Received answer from receiver
        await setRemoteDescription(data.data);
      } else if (data.type === "icecandidate") {
        // Received ICE candidate
        await addIceCandidate(data.data);
      } else if (data.type === "chat") {
        // Received chat message
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
        setIsLoading(true);
        setIsConnected(false);
        setRemoteUserName(undefined);
        setMessages([]);
        cleanupWebRTC();
        toast.info("Finding someone new...");
      } else if (data.type === "deleteuser") {
        // Other user ended the call - reset the connection but stay on page
        setIsConnected(false);
        setRemoteUserName(undefined);
        setMessages([]);
        cleanupWebRTC();
        toast.info("User disconnected. Click Next to find someone new.");
      }
    },
    [addLocalStreamToPeer, createOffer, createAnswer, setRemoteDescription, addIceCandidate, cleanupWebRTC, roomId]
  );

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setIsLoading(false);
    setRoomId(null);
    cleanupWebRTC();
    toast.error("Disconnected from server");
  }, [cleanupWebRTC]);

  const handleError = useCallback(
    (error: Event) => {
      setIsConnected(false);
      setIsLoading(false);
      setRoomId(null);
      cleanupWebRTC();
      toast.error("Connection error - Attempting to reconnect...");
    },
    [cleanupWebRTC]
  );

  // Connect to WebSocket backend
  const backendHost = "vibenet-m5rv.onrender.com"; // Render backend URL
  const wsUrl = window.location.hostname.includes("localhost")
    ? "ws://localhost:8081"
    : `wss://${backendHost}`;

  const { send: sendWebSocket, isConnected: wsConnected, disconnect: disconnectWebSocket } = useWebSocket({
    url: wsUrl,
    onConnect: handleConnect,
    onMessage: handleMessage,
    onDisconnect: handleDisconnect,
    onError: handleError,
    shouldReconnect: false, // Don't auto-reconnect
  });

  // Setup ICE candidate listener
  useEffect(() => {
    if (!peerConnection) return;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendWebSocket({
          type: "icecandidate",
          Roomid: roomId,
          data: event.candidate,
        });
      }
    };
  }, [peerConnection, roomId, sendWebSocket]);

  const handleEndCall = () => {
    // Send end call message to the other user
    if (roomId) {
      sendWebSocket({
        type: "deleteuser",
        Roomid: roomId,
      });
    }
    // Clean up WebRTC immediately
    cleanupWebRTC();
    // Disconnect from WebSocket
    disconnectWebSocket();
    // Wait a bit longer before navigating to ensure disconnect completes
    setTimeout(() => {
      navigate("/lobby", { state: { nickname } });
    }, 500);
  };

  const handleNextUser = () => {
    if (roomId) {
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
      sendWebSocket({
        type: "chat",
        Roomid: roomId,
        message: text,
      });
    }
  }, [roomId, sendWebSocket]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupWebRTC();
      disconnectWebSocket();
    };
  }, [cleanupWebRTC, disconnectWebSocket]);

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
