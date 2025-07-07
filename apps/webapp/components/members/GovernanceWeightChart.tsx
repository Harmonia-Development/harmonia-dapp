const roles = [
	{ label: 'Core Contributors', value: 35, color: 'bg-purple-500' },
	{ label: 'Governance Leads', value: 25, color: 'bg-blue-500' },
	{ label: 'Technical Advisors', value: 20, color: 'bg-yellow-500' },
	{ label: 'Community Managers', value: 15, color: 'bg-pink-500' },
	{ label: 'Members', value: 5, color: 'bg-green-500' },
]

const topVoters = [
	{ name: 'stellar.dev', role: 'Core Contributor', power: '2.5x' },
	{ name: 'crypto.guru', role: 'Governance Lead', power: '2.2x' },
	{ name: 'blockchain.wizard', role: 'Technical Advisor', power: '1.8x' },
]

export default function GovernanceWeight() {
	return (
		<div className="bg-gray-900 p-4 rounded-xl">
			<h2 className="text-xl font-semibold mb-4">Governance Weight</h2>
			<div className="mb-4">
				<p className="text-sm text-gray-400">Distribution of voting power across roles</p>
				<div className="flex flex-wrap gap-2 mt-2">
					{roles.map((r) => (
						<div key={r.label} className="flex items-center gap-2">
							<div className={`w-3 h-3 rounded-full ${r.color}`} />
							<span className="text-sm">
								{r.label} ({r.value}%)
							</span>
						</div>
					))}
				</div>
			</div>
			<div>
				<p className="text-sm text-gray-400 mb-2">Top Voting Power</p>
				<ul className="space-y-2">
					{topVoters.map((v) => (
						<li key={v.name} className="flex justify-between border-b border-gray-700 pb-2">
							<div>
								<p className="text-sm font-semibold">{v.name}</p>
								<p className="text-xs text-gray-400">{v.role}</p>
							</div>
							<span className="font-bold">{v.power}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
