import { Video } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} rounded-xl bg-primary flex items-center justify-center glow-primary`}>
        <Video className="w-1/2 h-1/2 text-primary-foreground" />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold gradient-text`}>
          VibeNet
        </span>
      )}
    </div>
  );
};

export default Logo;
