'use client'
import MembersDashboard from '@/components/members/MembersDashboard'

export default function Page() {
	return (
		<div className="bg-black h-full md:h-screen">
			<div className="min-w-screen flex justify-between items-center px-5 pt-4">
				<MembersDashboard />
			</div>
		</div>
	)
}

