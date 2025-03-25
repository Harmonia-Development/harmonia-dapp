import React from 'react';
import { 
  FileText, 
  Wallet, 
  Users 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Define interfaces for notification props
interface NotificationItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  timestamp: string;
  isNew?: boolean;
}

// Notification Item Component
const NotificationItem: React.FC<NotificationItemProps> = ({
  icon: Icon,
  title,
  description,
  timestamp,
  isNew = false
}) => {
  return (
    <div className={cn(
      "flex items-center space-x-3 p-3 my-2 rounded-lg transition-all duration-300",
      "hover:bg-[#2A2A2A] cursor-pointer",
      isNew ? "bg-[#2A2A2A]/50" : "bg-transparent"
    )}>
      <div className={cn(
        "p-2 rounded-full",
        isNew ? "bg-blue-500/20" : "bg-gray-500/20"
      )}>
        <Icon 
          className={cn(
            "w-5 h-5",
            isNew ? "text-blue-400" : "text-gray-400"
          )} 
          strokeWidth={1.5} 
        />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-center">
          <h3 className="text-white text-sm font-medium">{title}</h3>
          {isNew && (
            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
              New
            </span>
          )}
        </div>
        <p className="text-gray-400 text-xs">{description}</p>
        <span className="text-gray-500 text-xs block">{timestamp}</span>
      </div>
    </div>
  );
};

export default NotificationItem;
