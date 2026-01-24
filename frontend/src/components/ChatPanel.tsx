import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  text: string;
  isOwn: boolean;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onClose?: () => void;
  isCollapsible?: boolean;
}

const ChatPanel = ({ messages, onSendMessage, onClose, isCollapsible = false }: ChatPanelProps) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full glass-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground">Chat</h3>
        {isCollapsible && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm">No messages yet</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Say hello to start chatting!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${message.isOwn ? "items-end" : "items-start"} animate-fade-in`}
            >
              <div className={message.isOwn ? "chat-bubble-outgoing" : "chat-bubble-incoming"}>
                {message.text}
              </div>
              <span className="text-xs text-muted-foreground/60 mt-1 px-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-secondary border-none focus-visible:ring-primary"
            aria-label="Message input"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="control-button-primary w-10 h-10 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
