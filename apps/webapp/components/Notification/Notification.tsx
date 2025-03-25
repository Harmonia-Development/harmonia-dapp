import NotificationItem from "./NotificationItem";
import { FileText, Wallet, Users } from "lucide-react";
const Notifications: React.FC = () => {
  return (
    <div className="bg-[#1E1E1E]  border border-[#2C2C2C] w-full">
      <div className="border-b border-[#2C2C2C] p-4">
        <div className="flex justify-between items-center  ">
          <div className="flex items-center space-x-2">
            <h2 className="text-white text-xl font-semibold">Notifications</h2>
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              2 new
            </span>
          </div>
          <button className="text-gray-400 hover:text-white text-xs">
            Mark all read
          </button>
        </div>

        <p className="text-base text-gray-400">Stay update on important DAO activites</p>
      </div>

      <div className="divide-y divide-[#2C2C2C] px-4">
        <NotificationItem
          icon={FileText}
          title="Proposal Ending Soon"
          description="Community Garden Initiative voting ends in 24 hours"
          timestamp="1 hour ago"
          isNew
        />
        <NotificationItem
          icon={Wallet}
          title="Treasury Update"
          description="Monthly treasury report is now available"
          timestamp="3 hours ago"
        />
        <NotificationItem
          icon={Users}
          title="New Member Joined"
          description="stellar.dev has joined the DAO"
          timestamp="1 day ago"
        />
      </div>
    </div>
  );
};

export default Notifications;
