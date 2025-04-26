"use client";
import { UserPlus } from "lucide-react";
import { Button } from "../ui/button";
import { InviteMemberModal } from "./modals/InviteMemberModal";
import { useState } from "react";

const MembersDashboard: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full flex justify-between items-center">
      <div>
        <h2 className="text-white text-2xl font-bold">Members</h2>
        <span className="text-gray-400 mt-1">
          Manage and explore DAO membership
        </span>
      </div>
      <Button
        onClick={() => setOpen(true)}
        className="bg-[#723DCA] text-white font-semibold rounded-md px-4 py-2 flex items-center hover:bg-[#5b2f9e]"
      >
        <UserPlus className="h-4 w-4" />
        Invite Member
      </Button>

      <InviteMemberModal open={open} onOpenChange={setOpen} />

      {/* <Button
        onClick={() => {
          toast({
            title: "Success",
            description: "Member invite created successfully",
          });
        }}
        className="bg-[#723DCA] text-white font-semibold rounded-md px-4 py-2 flex items-center hover:bg-[#5b2f9e]"
      >
        <UserPlus className="h-4 w-4" />
        Invite Member
      </Button> */}
    </div>
  );
};

export default MembersDashboard;
