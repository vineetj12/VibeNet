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
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
          setRemoteStream(remoteStreamRef.current);
        }
        remoteStreamRef.current?.addTrack(event.track);
      };

      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === "failed") {
          onError?.("Connection failed");
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
      };

      peerConnectionRef.current = peerConnection;
      return peerConnection;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create peer connection";
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
      // Check if we have a remote offer
      if (peerConnectionRef.current.signalingState !== "have-remote-offer") {
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
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(description)
        );
        return true;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to set remote description";
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
        return false;
      }
    },
    []
  );

  const cleanup = useCallback(() => {
    // Close all peer connections and senders
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach((sender) => {
        peerConnectionRef.current?.removeTrack(sender);
      });
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    // Disable and stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
      localStreamRef.current = null;
    }
    // Disable and stop remote tracks
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
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
