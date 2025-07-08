import React from 'react'
import NotificationDashboard from './NotificationDashboard'
import NotificationSettings from './NotificationSetting'

const DashBoardMain = () => {
	return (
		<div className="flex flex-col gap-2 lg:flex-row h-full">
			<div className="w-full lg:w-[70%]">
				<NotificationDashboard />
			</div>
			<div className="w-full lg:w-[28%] h-full">
				<NotificationSettings />
			</div>
		</div>
	)
}

export default DashBoardMain
