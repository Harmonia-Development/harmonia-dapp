export default function MemberStats() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
			<div className="bg-purple-900 p-4 rounded-xl">
				<h2 className="text-lg font-semibold">Active Members</h2>
				<p className="text-2xl font-bold">2,345</p>
				<p className="text-green-400 text-sm">+130 this month</p>
				<div className="mt-2 h-2 w-full bg-purple-700 rounded-full">
					<div className="h-full bg-purple-400 rounded-full w-[85%]" />
				</div>
			</div>
			<div className="bg-blue-900 p-4 rounded-xl">
				<h2 className="text-lg font-semibold">Member Growth</h2>
				<p className="text-2xl font-bold">+12.5%</p>
				<p className="text-blue-400 text-sm">+3.2% from last month</p>
				<div className="mt-2 h-2 w-full bg-blue-700 rounded-full">
					<div className="h-full bg-blue-400 rounded-full w-[68%]" />
				</div>
			</div>
			<div className="bg-green-900 p-4 rounded-xl">
				<h2 className="text-lg font-semibold">Retention Rate</h2>
				<p className="text-2xl font-bold">92%</p>
				<p className="text-green-400 text-sm">+5% from last quarter</p>
				<div className="mt-2 h-2 w-full bg-green-700 rounded-full">
					<div className="h-full bg-green-400 rounded-full w-[92%]" />
				</div>
			</div>
			<div className="bg-yellow-900 p-4 rounded-xl">
				<h2 className="text-lg font-semibold">Governance Participation</h2>
				<p className="text-2xl font-bold">78%</p>
				<p className="text-yellow-400 text-sm">+8% from last vote</p>
				<div className="mt-2 h-2 w-full bg-yellow-700 rounded-full">
					<div className="h-full bg-yellow-400 rounded-full w-[78%]" />
				</div>
			</div>
		</div>
	)
}
