'use client'
import GovernanceWeight from '@/components/members/GovernanceWeightChart'
import MemberDirectory from '@/components/members/MemberDirectoryTable'
import MemberStats from '@/components/members/MemberStats'
import { ChartSkeleton, StatsSkeleton, TableSkeleton } from '@/components/ui/loading-skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { InviteMemberModal } from './modals/InviteMemberModal'
import { ReferralStatsTabs } from './referrals/ReferralStatsTabs'

interface MembersDashboardProps {
	isLoading?: boolean
}

const MembersDashboard: React.FC<MembersDashboardProps> = ({ isLoading = false }) => {
	const [open, setOpen] = useState(false)

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6 sm:gap-8">
				<div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<Skeleton className="h-8 w-32 mb-2" />
						<Skeleton className="h-4 w-48" />
					</div>
					<Skeleton className="h-10 w-32" />
				</div>
				<StatsSkeleton />
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
					<TableSkeleton rows={8} />
					<ChartSkeleton />
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-6 sm:gap-8">
			<div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-white">Members</h2>
					<span className="text-gray-400 mt-1 text-sm sm:text-base">
						Manage and explore DAO membership
					</span>
				</div>
				<Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
					<UserPlus className="h-4 w-4 mr-2" />
					Invite Member
				</Button>
			</div>

			<MemberStats />

			<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
				<MemberDirectory />
				<GovernanceWeight />
				<ReferralStatsTabs />
			</div>

			<InviteMemberModal open={open} onOpenChange={setOpen} />
		</div>
	)
}

export default MembersDashboard
