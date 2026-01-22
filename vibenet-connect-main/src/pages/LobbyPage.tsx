import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Users, Video, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Logo from "@/components/Logo";
import UserCard from "@/components/UserCard";
import { toast } from "sonner";

const LobbyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const nickname = location.state?.nickname || "Anonymous";
  const [activeUsers, setActiveUsers] = useState(47);

  // Simulate active users fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const mockUsers: Array<{ nickname: string; status: 'waiting' | 'in-call' }> = [];

  const handleJoinRoom = () => {
    toast.info("Requesting camera and microphone access...", {
      duration: 2000,
    });
    setTimeout(() => {
      navigate("/call", { state: { nickname } });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 md:p-6 border-b border-border">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium">{activeUsers} online</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome, <span className="gradient-text">{nickname}</span>!
            </h1>
            <p className="text-muted-foreground">
              Ready to meet someone new? Join a room and start vibing.
            </p>
          </div>

          {/* Join Room CTA */}
          <div className="glass-panel p-6 md:p-8 mb-8 animate-slide-up">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Video className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-semibold mb-2">Start a Video Chat</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  You'll be connected with a random stranger. Be respectful and have fun!
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground mb-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                        <Info className="w-4 h-4" />
                        Camera & mic required
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>You'll need to allow camera and microphone access to start a video chat. Don't worry — you can toggle them off anytime during the call.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <Button
                onClick={handleJoinRoom}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 glow-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Join Room
              </Button>
            </div>
          </div>

          {/* Active Users Section */}
          {mockUsers.length > 0 && (
            <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">People in the Lobby</h3>
              </div>
              <div className="space-y-3">
                {mockUsers.map((user, index) => (
                  <div key={user.nickname} style={{ animationDelay: `${300 + index * 50}ms` }}>
                    <UserCard nickname={user.nickname} status={user.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LobbyPage;
