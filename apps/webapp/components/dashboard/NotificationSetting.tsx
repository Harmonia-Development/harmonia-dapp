'use client'
import { Switch } from '@/components/ui/switch'
import { logDev } from '@/lib/utils/logger'
import type React from 'react'
import { useState } from 'react'

type NotificationSettingsProps = object

const NotificationSettings: React.FC<NotificationSettingsProps> = () => {
	// State for active tab
	const [activeTab, setActiveTab] = useState('System')

	// State for toggle switches
	const [emailEnabled, setEmailEnabled] = useState(false)
	const [pushEnabled, setPushEnabled] = useState(false)
	const [inAppEnabled, setInAppEnabled] = useState(false)

	// Tabs data
	const tabs = ['Governance', 'Community', 'Treasury', 'System']

	// Handle Save Settings button click
	const handleSaveSettings = () => {
		logDev('Settings saved:', {
			email: emailEnabled,
			push: pushEnabled,
			inApp: inAppEnabled,
		})
		// Add logic to save settings (e.g., API call)
	}

	return (
		<div className="w-full p-4 sm:p-6 bg-gray-900 rounded-xl shadow-lg text-white">
			{/* Header */}
			<h2 className="text-lg sm:text-xl font-semibold mb-2">Notification Settings</h2>
			<p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
				Manage how you receive notifications
			</p>

			{/* Tabs */}
			<div className="flex justify-between mb-4 sm:mb-6 border-b border-gray-700 overflow-x-auto">
				{tabs.map((tab) => (
					<button
						key={tab}
						type="button"
						className={`flex-1 py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
							activeTab === tab
								? 'text-white border-b-2 border-purple-500'
								: 'text-gray-400 hover:text-gray-200'
						}`}
						onClick={() => setActiveTab(tab)}
					>
						{tab}
					</button>
				))}
			</div>

			{/* Tab Content (System Tab) */}
			{activeTab === 'System' && (
				<div className="space-y-4 sm:space-y-6">
					{/* Email Toggle */}
					<div className="flex items-center justify-between gap-3">
						<div className="flex-1 min-w-0">
							<h3 className="text-xs sm:text-sm font-medium mb-1">Email</h3>
							<p className="text-xs text-gray-400">Receive system notifications via email</p>
						</div>
						<Switch
							checked={emailEnabled}
							onCheckedChange={setEmailEnabled}
							className="flex-shrink-0 data-[state=unchecked]:bg-gray-300"
						/>
					</div>

					{/* Push Toggle */}
					<div className="flex items-center justify-between gap-3">
						<div className="flex-1 min-w-0">
							<h3 className="text-xs sm:text-sm font-medium mb-1">Push</h3>
							<p className="text-xs text-gray-400">Receive system notifications via push</p>
						</div>
						<Switch
							checked={pushEnabled}
							onCheckedChange={setPushEnabled}
							className="flex-shrink-0 data-[state=unchecked]:bg-gray-300"
						/>
					</div>

					{/* In-App Toggle */}
					<div className="flex items-center justify-between gap-3">
						<div className="flex-1 min-w-0">
							<h3 className="text-xs sm:text-sm font-medium mb-1">In-App</h3>
							<p className="text-xs text-gray-400">Receive system notifications in-app</p>
						</div>
						<Switch
							checked={inAppEnabled}
							onCheckedChange={setInAppEnabled}
							className="flex-shrink-0 data-[state=unchecked]:bg-gray-300"
						/>
					</div>
				</div>
			)}

			{/* Save Settings Button */}
			<div className="mt-6 sm:mt-8">
				<button
					type="button"
					className="w-full py-2 px-4 bg-purple-600 text-white text-sm sm:text-base rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
					onClick={handleSaveSettings}
				>
					Save Settings
				</button>
			</div>
		</div>
	)
}

export default NotificationSettings
