import { Mic, MicOff, Video, VideoOff, SkipForward, PhoneOff, Settings, MessageCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ControlBarProps {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onNextUser: () => void;
  onEndCall: () => void;
  onToggleChat?: () => void;
  onOpenSettings?: () => void;
  showChatToggle?: boolean;
  isChatOpen?: boolean;
}

const ControlBar = ({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onNextUser,
  onEndCall,
  onToggleChat,
  onOpenSettings,
  showChatToggle = false,
  isChatOpen = false,
}: ControlBarProps) => {
  return (
    <div className="glass-panel px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center justify-center gap-3 md:gap-4">
        {/* Mute Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleMute}
              className={`control-button ${isMuted ? 'bg-destructive/80 hover:bg-destructive' : ''}`}
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Mic className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMuted ? "Unmute" : "Mute"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Camera Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleCamera}
              className={`control-button ${isCameraOff ? 'bg-destructive/80 hover:bg-destructive' : ''}`}
              aria-label={isCameraOff ? "Turn on camera" : "Turn off camera"}
            >
              {isCameraOff ? (
                <VideoOff className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Video className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCameraOff ? "Turn on camera" : "Turn off camera"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Next User Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onNextUser}
              className="control-button-accent"
              aria-label="Connect with next user"
            >
              <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Next</p>
          </TooltipContent>
        </Tooltip>

        {/* End Call Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onEndCall}
              className="control-button-destructive"
              aria-label="End call"
            >
              <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Leave</p>
          </TooltipContent>
        </Tooltip>

        {/* Chat Toggle (Mobile) */}
        {showChatToggle && onToggleChat && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleChat}
                className={`control-button ${isChatOpen ? 'bg-primary/80' : ''}`}
                aria-label="Toggle chat"
              >
                <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Settings Button */}
        {onOpenSettings && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenSettings}
                className="control-button"
                aria-label="Open settings"
              >
                <Settings className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default ControlBar;
