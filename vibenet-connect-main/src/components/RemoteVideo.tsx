import { useEffect, useRef } from "react";
import { User } from "lucide-react";

interface RemoteVideoProps {
  isConnected: boolean;
  isLoading?: boolean;
  userName?: string;
  remoteStream?: MediaStream | null;
}

const RemoteVideo = ({ isConnected, isLoading = false, userName, remoteStream }: RemoteVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="video-container w-full aspect-video relative bg-black">
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-secondary flex items-center justify-center mb-4 animate-pulse-glow">
            <User className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
          </div>
          <div className="flex gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-muted-foreground text-sm">Waiting for a connection...</p>
        </div>
      ) : isConnected && remoteStream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {userName && (
            <div className="absolute bottom-4 left-4 glass-panel px-3 py-1.5">
              <span className="text-sm font-medium">{userName}</span>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
            <User className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No one connected</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Click "Next" to find someone</p>
        </div>
      )}
    </div>
  );
};

export default RemoteVideo;
