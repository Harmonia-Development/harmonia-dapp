import Notifications from '@/components/Notification/Notification'
import DAODashboard from '@/components/dashboard/DAODashboard'
import Header from '@/components/dashboard/Header'
import React from 'react'

const page = () => {
	return (
		<div className="bg-black h-full md:h-screen">
			<Header />
			<div className="flex flex-col md:flex-row justify-between pr-4">
				<div className="md:w-[78%]">
					<DAODashboard />
				</div>
				<div className="md:w-[20%]">
					<Notifications />
				</div>
			</div>
		</div>
	)
}

export default page
