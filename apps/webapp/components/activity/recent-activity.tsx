"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Coins, type LucideIcon, Users, Vote } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ActivityType =
  | "treasury-transfer"
  | "proposal-approved"
  | "new-member"
  | "new-proposal"
  | "funds-received";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  icon?: React.ReactNode;
  avatar?: string;
  initials?: string;
}

interface RecentActivityProps {
  data: ActivityItem[];
  onClick?: (item: ActivityItem) => void;
  className?: string;
  title?: string;
  subtitle?: string;
}

// Map activity types to their respective icons
const activityIcons: Record<ActivityType, LucideIcon> = {
  "treasury-transfer": Coins,
  "proposal-approved": Vote,
  "new-member": Users,
  "new-proposal": Vote,
  "funds-received": Coins,
};

// Map activity types to their respective colors
const activityColors: Record<ActivityType, string> = {
  "treasury-transfer": "bg-[#121216] text-blue-300",
  "proposal-approved": "bg-[#121216]  text-white",
  "new-member": "bg-[#121216]  text-purple-300",
  "new-proposal": "bg-[#121216]  text-white",
  "funds-received": "bg-[#121216]  text-blue-300",
};

export default function RecentActivity({
  data,
  onClick,
  className,
  title = "Recent Activity",
  subtitle = "Latest actions in your DAO",
}: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(data || []);

  // Update activities when data changes
  useEffect(() => {
    if (data) {
      setActivities(data);
    }
  }, [data]);

  // Format relative time (e.g., "2h ago")
  const formatRelativeTime = (timestamp: string) => {
    return timestamp;
  };

  return (
    <Card className={cn("bg-[#010102] border-gray-800 m-3", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold text-white">{title}</CardTitle>
        <CardDescription className="text-gray-400 text-base">
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const IconComponent = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];

          return (
            <div
              key={activity.id}
              className="flex items-start space-x-4 cursor-pointer hover:bg-gray-900 rounded-md p-1 transition-colors"
              onClick={() => onClick?.(activity)}
            >
              <div
                className={cn(
                  "p-2 rounded-full flex items-center justify-center",
                  colorClass
                )}
              >
                <IconComponent className="h-5 w-5" />
              </div>

              <div className="flex-1 space-y-1">
                {activity.initials && (
                  <div className="flex gap-2">
                    <p className="text-white font-medium">{activity.title}</p>
                    <div className="h-5 w-5 rounded-full bg-[#171719] flex items-center justify-center text-xs font-medium text-white">
                      {activity.initials}
                    </div>
                  </div>
                )}
                <p className="text-gray-400 text-sm">{activity.description}</p>
                <p className="text-gray-400 text-sm">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
