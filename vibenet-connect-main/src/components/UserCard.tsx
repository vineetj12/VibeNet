import { User, Phone, Clock } from "lucide-react";

interface UserCardProps {
  nickname: string;
  status: "waiting" | "in-call";
  avatarUrl?: string;
}

const UserCard = ({ nickname, status, avatarUrl }: UserCardProps) => {
  const statusConfig = {
    waiting: {
      label: "Waiting",
      icon: Clock,
      className: "text-accent bg-accent/20",
    },
    "in-call": {
      label: "In Call",
      icon: Phone,
      className: "text-primary bg-primary/20",
    },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="glass-panel p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors animate-fade-in">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={nickname} className="w-full h-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{nickname}</p>
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${currentStatus.className}`}>
          <StatusIcon className="w-3 h-3" />
          {currentStatus.label}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
