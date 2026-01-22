import { useEffect, useRef, useState, useCallback } from "react";

interface UseWebRTCProps {
  onStream?: (stream: MediaStream) => void;
  onError?: (error: string) => void;
}

export const useWebRTC = ({ onStream, onError }: UseWebRTCProps) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const createPeerConnection = useCallback(() => {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: ["stun:stun.l.google.com:19302"] },
          { urls: ["stun:stun1.l.google.com:19302"] },
        ],
      });

      peerConnection.ontrack = (event) => {
        console.log("Remote track received:", event.track.kind);
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
          setRemoteStream(remoteStreamRef.current);
        }
        remoteStreamRef.current?.addTrack(event.track);
      };

      peerConnection.onconnectionstatechange = () => {
        console.log("Connection state:", peerConnection.connectionState);
        if (peerConnection.connectionState === "failed") {
          onError?.("Connection failed");
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peerConnection.iceConnectionState);
      };

      peerConnectionRef.current = peerConnection;
      return peerConnection;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create peer connection";
      console.error("Error creating peer connection:", errorMsg);
      onError?.(errorMsg);
      return null;
    }
  }, [onError]);

  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to get local media";
      console.error("Error getting local stream:", errorMsg);
      onError?.(errorMsg);
      return null;
    }
  }, [onError]);

  const addLocalStreamToPeer = useCallback(async () => {
    // Create peer connection first if it doesn't exist
    if (!peerConnectionRef.current) {
      const pc = createPeerConnection();
      if (!pc) return false;
    }

    // Get local stream if we don't have it
    if (!localStreamRef.current) {
      const stream = await getLocalStream();
      if (!stream) return false;
    }

    // Add local tracks to peer connection only once
    if (localStreamRef.current && peerConnectionRef.current) {
      const existingTracks = peerConnectionRef.current.getSenders().map(sender => sender.track?.id);
      localStreamRef.current.getTracks().forEach((track) => {
        // Only add if not already added
        if (!existingTracks.includes(track.id)) {
          peerConnectionRef.current?.addTrack(track, localStreamRef.current!);
          console.log("Added track to peer connection:", track.kind);
        }
      });
    }

    return true;
  }, [createPeerConnection, getLocalStream]);

  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current) {
      onError?.("Peer connection not initialized");
      return null;
    }

    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      return offer;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create offer";
      onError?.(errorMsg);
      return null;
    }
  }, [onError]);

  const createAnswer = useCallback(async () => {
    if (!peerConnectionRef.current) {
      onError?.("Peer connection not initialized");
      return null;
    }

    try {
      console.log("📝 Creating answer, signalingState:", peerConnectionRef.current.signalingState);
      
      // Check if we have a remote offer
      if (peerConnectionRef.current.signalingState !== "have-remote-offer") {
        console.warn("⚠️ Cannot create answer in state:", peerConnectionRef.current.signalingState);
        onError?.("Invalid state for creating answer: " + peerConnectionRef.current.signalingState);
        return null;
      }
      
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      return answer;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create answer";
      onError?.(errorMsg);
      return null;
    }
  }, [onError]);

  const setRemoteDescription = useCallback(
    async (description: RTCSessionDescriptionInit) => {
      if (!peerConnectionRef.current) {
        onError?.("Peer connection not initialized");
        return false;
      }

      try {
        console.log("Setting remote description, type:", description.type, "signalingState:", peerConnectionRef.current.signalingState);
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(description)
        );
        console.log("Remote description set, signalingState now:", peerConnectionRef.current.signalingState);
        return true;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to set remote description";
        console.error("Error setting remote description:", errorMsg);
        onError?.(errorMsg);
        return false;
      }
    },
    [onError]
  );

  const addIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      if (!peerConnectionRef.current) return false;

      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        return true;
      } catch (error) {
        console.error("❌ Error adding ICE candidate:", error);
        return false;
      }
    },
    []
  );

  const cleanup = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
      setRemoteStream(null);
    }
  }, []);

  return {
    remoteStream,
    localStream: localStreamRef.current,
    peerConnection: peerConnectionRef.current,
    createPeerConnection,
    getLocalStream,
    addLocalStreamToPeer,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    cleanup,
  };
};
