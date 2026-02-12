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

  // Log component mount
  useEffect(() => {
    console.log("[VideoCallPage] Component mounted");
    console.log("[VideoCallPage] Nickname:", nickname);
    return () => {
      console.log("[VideoCallPage] Component unmounting");
    };
  }, []);

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
      console.error("[VideoCallPage] WebRTC error:", error);
      toast.error("WebRTC error: " + error);
    },
  });

  const handleConnect = useCallback(() => {
    console.log("[VideoCallPage] WebSocket connected!");
    setIsLoading(true);
    toast.info("Waiting for someone to connect...");
  }, []);

  const handleMessage = useCallback(
    async (data: any) => {
      console.log("[VideoCallPage] Message received:", data.type, data);
      if (data.type === "ownership") {
        // Matched with someone!
        console.log("[VideoCallPage] Ownership received, roomId:", data.Roomid, "role:", data.data);
        setRoomId(data.Roomid);
        setRole(data.data);
        setIsLoading(false);
        setIsConnected(true);
        setRemoteUserName(`Stranger-${data.Roomid.slice(0, 6)}`);
        toast.success("Connected with someone!");

        // Setup WebRTC
        console.log("[VideoCallPage] Setting up WebRTC...");
        await addLocalStreamToPeer();

        // If we're the sender (initiator), create offer
        if (data.data === "sender") {
          console.log("[VideoCallPage] Creating offer...");
          const offer = await createOffer();
          if (offer) {
            console.log("[VideoCallPage] Sending offer");
            sendWebSocket({
              type: "createoffer",
              Roomid: data.Roomid,
              data: offer,
            });
          }
        }
      } else if (data.type === "createoffer") {
        // Received offer from sender
        console.log("[VideoCallPage] Received offer");
        await setRemoteDescription(data.data);

        // Create answer
        console.log("[VideoCallPage] Creating answer...");
        const answer = await createAnswer();
        if (answer) {
          console.log("[VideoCallPage] Sending answer");
          sendWebSocket({
            type: "createanswer",
            Roomid: roomId,
            data: answer,
          });
        }
      } else if (data.type === "createanswer") {
        // Received answer from receiver
        console.log("[VideoCallPage] Received answer");
        await setRemoteDescription(data.data);
      } else if (data.type === "icecandidate") {
        // Received ICE candidate
        console.log("[VideoCallPage] Received ICE candidate");
        await addIceCandidate(data.data);
      } else if (data.type === "chat") {
        // Received chat message
        console.log("[VideoCallPage] Received chat message");
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
        console.log("[VideoCallPage] Next user request");
        setIsLoading(true);
        setIsConnected(false);
        setRemoteUserName(undefined);
        setMessages([]);
        cleanupWebRTC();
        toast.info("Finding someone new...");
      } else if (data.type === "deleteuser") {
        // Other user ended the call - reset the connection but stay on page
        console.log("[VideoCallPage] Other user disconnected");
        setIsConnected(false);
        setRemoteUserName(undefined);
        setMessages([]);
        cleanupWebRTC();
        toast.info("User disconnected. Click Next to find someone new.");
      } else if (data.type === "connected") {
        console.log("[VideoCallPage] Server connection confirmed:", data.message);
      } else {
        console.log("[VideoCallPage] Unknown message type:", data.type);
      }
    },
    [addLocalStreamToPeer, createOffer, createAnswer, setRemoteDescription, addIceCandidate, cleanupWebRTC, roomId]
  );

  const handleDisconnect = useCallback(() => {
    console.log("[VideoCallPage] WebSocket disconnected");
    setIsConnected(false);
    setIsLoading(false);
    setRoomId(null);
    cleanupWebRTC();
    toast.error("Disconnected from server");
  }, [cleanupWebRTC]);

  const handleError = useCallback(
    (error: Event) => {
      console.error("[VideoCallPage] WebSocket error:", error);
      setIsConnected(false);
      setIsLoading(false);
      setRoomId(null);
      cleanupWebRTC();
      toast.error("Connection error - Attempting to reconnect...");
    },
    [cleanupWebRTC]
  );

  // Connect to WebSocket backend
  const getBackendUrl = () => {
    // For development
    if (window.location.hostname.includes("localhost")) {
      console.log("[VideoCallPage] Using localhost backend: ws://localhost:8080");
      return "ws://localhost:8080";
    }
    
    // For production - use environment variable or default
    const backendHost = import.meta.env.VITE_BACKEND_URL || "vibenet-m5rv.onrender.com";
    console.log("[VideoCallPage] Backend URL from env:", import.meta.env.VITE_BACKEND_URL);
    console.log("[VideoCallPage] Using backend host:", backendHost);
    const url = backendHost.startsWith("ws://") || backendHost.startsWith("wss://")
      ? backendHost
      : `wss://${backendHost}`;
    console.log("[VideoCallPage] Final WebSocket URL:", url);
    return url;
  };
  
  const wsUrl = getBackendUrl();

  const { send: sendWebSocket, isConnected: wsConnected, disconnect: disconnectWebSocket } = useWebSocket({
    url: wsUrl,
    onConnect: handleConnect,
    onMessage: handleMessage,
    onDisconnect: handleDisconnect,
    onError: handleError,
    shouldReconnect: true, // Auto-reconnect enabled
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
