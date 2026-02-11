import { useEffect, useRef } from "react";

interface LocalPreviewProps {}

const STORAGE_KEY = "vibenet.selectedCamera";

const LocalPreview = ({}: LocalPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Get local media stream, preferring previously selected camera
    const getLocalStream = async () => {
      try {
        const savedDeviceId = window.localStorage.getItem(STORAGE_KEY) || undefined;

        const videoConstraints: MediaTrackConstraints = savedDeviceId
          ? { deviceId: { exact: savedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: true,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        // Failed to get local media; ignore silently
      }
    };

    getLocalStream();

    return () => {
      // On unmount store the camera deviceId (if available) and stop tracks
      const stream = streamRef.current ?? (videoRef.current?.srcObject as MediaStream | null);
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0];
        try {
          const settings = videoTrack?.getSettings();
          if (settings && settings.deviceId) {
            window.localStorage.setItem(STORAGE_KEY, String(settings.deviceId));
          }
        } catch (e) {
          // ignore
        }

        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="pip-container bg-card overflow-hidden">
      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
      <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-sm">
        <span className="text-xs text-muted-foreground">You</span>
      </div>
    </div>
  );
};

export default LocalPreview;
