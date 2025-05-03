import DAODashboard from '@/components/dashboard/DAODashboard'
import DashBoardMain from '@/components/dashboard/DashBoardMain'
import Header from '@/components/dashboard/Header'
import React from 'react'

const page = () => {
	return (
		<div className="bg-black h-full md:h-screen">
			<Header />
			<div className="">
				<div className="px-7 py-4">
					<div className="flex justify-between items-center  ">
						<div className="flex items-center space-x-2">
							<h2 className="text-white text-xl font-semibold">Notifications</h2>
							<span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">2 new</span>
						</div>
						<button type="button" className="text-gray-400 hover:text-white text-xs">
							Mark all read
						</button>
					</div>

					<p className="text-base text-gray-400">Stay update on important DAO activites</p>
				</div>
				<DAODashboard />
				<DashBoardMain />
			</div>
		</div>
	)
}

export default page
