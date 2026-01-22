import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, Video, Zap, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { toast } from "sonner";

const Index = () => {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (!nickname.trim()) {
      toast.error("Please enter a nickname to continue");
      return;
    }
    navigate("/lobby", { state: { nickname: nickname.trim() } });
  };

  const features = [
    {
      icon: Zap,
      title: "Instant Connect",
      description: "No sign-up needed. Jump into conversations in seconds.",
    },
    {
      icon: Users,
      title: "Meet New People",
      description: "Connect with strangers from around the world.",
    },
    {
      icon: Shield,
      title: "Anonymous & Safe",
      description: "Your privacy is protected. Chat without worry.",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6">
        <Logo size="md" />
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Instant video connections.
              <br />
              <span className="gradient-text">Meet someone new.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Jump into spontaneous video chats with people from around the world.
              No accounts, no hassle — just pure connection.
            </p>
          </div>

          {/* Hero Illustration */}
          <div className="flex justify-center mb-12 md:mb-16 animate-float">
            <div className="relative">
              <div className="w-64 h-40 md:w-80 md:h-48 rounded-2xl bg-card border border-border shadow-lg flex items-center justify-center">
                <Video className="w-16 h-16 md:w-20 md:h-20 text-primary" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-16 md:w-28 md:h-18 rounded-xl bg-secondary border border-border shadow-lg flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="absolute -top-3 -left-3 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium animate-pulse-glow">
                Live Now
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-md mx-auto glass-panel p-6 md:p-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="space-y-4">
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-foreground mb-2">
                  Choose a nickname
                </label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g., CosmicTraveler"
                  className="bg-secondary border-none focus-visible:ring-primary text-lg py-6"
                  maxLength={20}
                  onKeyDown={(e) => e.key === "Enter" && handleStart()}
                />
              </div>
              <Button
                onClick={handleStart}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg glow-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Vibing
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                By continuing, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">Terms</a> and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 md:mt-24">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 animate-fade-in"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-border mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 VibeNet. Connect freely, responsibly.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
