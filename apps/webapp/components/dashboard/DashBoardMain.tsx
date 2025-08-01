import NotificationDashboard from './NotificationDashboard'
import NotificationSettings from './NotificationSetting'

const DashBoardMain = () => {
	return (
		<div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
			<div className="w-full lg:w-[70%]">
				<NotificationDashboard />
			</div>
			<div className="w-full lg:w-[28%]">
				<NotificationSettings />
			</div>
		</div>
	)
}

export default DashBoardMain
