import { useEffect, useRef } from "react";

interface LocalPreviewProps {
}

const LocalPreview = ({ }: LocalPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Get local media stream
    const getLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        // Failed to get local media
      }
    };

    getLocalStream();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="pip-container bg-card overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-sm">
        <span className="text-xs text-muted-foreground">You</span>
      </div>
    </div>
  );
};

export default LocalPreview;
