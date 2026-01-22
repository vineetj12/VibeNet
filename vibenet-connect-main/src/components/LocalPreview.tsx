import { useEffect, useRef } from "react";
import { User, VideoOff } from "lucide-react";

interface LocalPreviewProps {
  isCameraOff: boolean;
}

const LocalPreview = ({ isCameraOff }: LocalPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isCameraOff) {
      // Stop the stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      return;
    }

    // Get local media stream
    const getLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("❌ Failed to get local media:", error);
      }
    };

    getLocalStream();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOff]);

  return (
    <div className="pip-container bg-card overflow-hidden">
      {isCameraOff ? (
        <div className="w-full h-full flex items-center justify-center bg-secondary">
          <VideoOff className="w-8 h-8 text-muted-foreground" />
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-sm">
        <span className="text-xs text-muted-foreground">You</span>
      </div>
    </div>
  );
};

export default LocalPreview;
