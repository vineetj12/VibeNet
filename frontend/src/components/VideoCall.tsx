import { useState } from "react";
import RemoteVideo from "./RemoteVideo";
import LocalPreview from "./LocalPreview";
import ControlBar from "./ControlBar";
import ChatPanel from "./ChatPanel";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  text: string;
  isOwn: boolean;
  timestamp: Date;
}

interface VideoCallProps {
  isConnected: boolean;
  isLoading?: boolean;
  remoteUserName?: string;
  remoteStream?: MediaStream | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onEndCall: () => void;
  onNextUser: () => void;
}

const VideoCall = ({ isConnected, isLoading, remoteUserName, remoteStream, messages, onSendMessage, onEndCall, onNextUser }: VideoCallProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="h-screen flex flex-col md:flex-row bg-background">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col p-2 md:p-4 gap-2 md:gap-4">
        {/* Video Container */}
        <div className="flex-1 relative min-h-0">
          <RemoteVideo
            isConnected={isConnected}
            isLoading={isLoading}
            userName={remoteUserName}
            remoteStream={remoteStream}
          />
          <LocalPreview />
        </div>

        {/* Controls */}
        <ControlBar
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onNextUser={onNextUser}
          onEndCall={onEndCall}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          showChatToggle={isMobile}
          isChatOpen={isChatOpen}
        />
      </div>

      {/* Chat Sidebar - Desktop */}
      {!isMobile && (
        <div className="w-80 xl:w-96 border-l border-border">
          <ChatPanel messages={messages} onSendMessage={onSendMessage} />
        </div>
      )}

      {/* Chat Panel - Mobile (Overlay) */}
      {isMobile && isChatOpen && (
        <div className="absolute inset-x-0 bottom-0 h-[60vh] z-50 animate-slide-up">
          <ChatPanel
            messages={messages}
            onSendMessage={onSendMessage}
            onClose={() => setIsChatOpen(false)}
            isCollapsible
          />
        </div>
      )}
    </div>
  );
};

export default VideoCall;
