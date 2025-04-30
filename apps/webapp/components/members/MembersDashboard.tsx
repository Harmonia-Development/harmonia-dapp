'use client'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { InviteMemberModal } from './modals/InviteMemberModal'
import MemberStats from "@/components/members/MemberStats"
import MemberDirectory from "@/components/members/MemberDirectoryTable"
import GovernanceWeight from "@/components/members/GovernanceWeightChart"

const MembersDashboard: React.FC = () => {
	const [open, setOpen] = useState(false)

	return (
		<div className="flex flex-col gap-8">
			<div className='w-full flex justify-between items-center'>
			<div>
				<h2 className="text-white text-2xl font-bold">Members</h2>
				<span className="text-gray-400 mt-1">Manage and explore DAO membership</span>
			</div>
			<Button
				onClick={() => setOpen(true)}
				className="bg-[#723DCA] text-white font-semibold rounded-md px-4 py-2 flex items-center hover:bg-[#5b2f9e]"
			>
				<UserPlus className="h-4 w-4" />
				Invite Member
			</Button>
			</div>
		
			<MemberStats />
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
				<MemberDirectory />
				<GovernanceWeight />
			</div>

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
	)
}

export default MembersDashboard
