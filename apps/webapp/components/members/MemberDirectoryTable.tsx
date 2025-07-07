const members = [
	{
		name: 'stellar.dev',
		role: 'Core Contributor',
		joinDate: 'May 15, 2022',
		status: 'Active',
		power: '2.5x',
	},
	{
		name: 'crypto.guru',
		role: 'Governance Lead',
		joinDate: 'Jun 22, 2022',
		status: 'Active',
		power: '2.2x',
	},
	{
		name: 'blockchain.wizard',
		role: 'Technical Advisor',
		joinDate: 'Aug 10, 2022',
		status: 'Active',
		power: '1.8x',
	},
	{
		name: 'dao.advocate',
		role: 'Community Manager',
		joinDate: 'Sep 5, 2022',
		status: 'Active',
		power: '1.5x',
	},
	{
		name: 'defi.analyst',
		role: 'Financial Analyst',
		joinDate: 'Oct 18, 2022',
		status: 'Active',
		power: '1.3x',
	},
	{
		name: 'nft.collector',
		role: 'Member',
		joinDate: 'Dec 3, 2022',
		status: 'Inactive',
		power: '1x',
	},
]

export default function MemberDirectory() {
	return (
		<div className="bg-gray-900 p-4 rounded-xl">
			<h2 className="text-xl font-semibold mb-4">Member Directory</h2>
			<div className="overflow-x-auto">
				<table className="min-w-full text-left text-sm">
					<thead className="bg-gray-800 text-gray-300">
						<tr>
							<th className="p-2">Member</th>
							<th className="p-2">Role</th>
							<th className="p-2">Join Date</th>
							<th className="p-2">Status</th>
							<th className="p-2">Voting Power</th>
						</tr>
					</thead>
					<tbody>
						{members.map((m) => (
							<tr key={m.name} className="border-b border-gray-700">
								<td className="p-2">{m.name}</td>
								<td className="p-2">{m.role}</td>
								<td className="p-2">{m.joinDate}</td>
								<td className="p-2">
									<span
										className={`px-2 py-1 rounded text-xs ${m.status === 'Active' ? 'bg-green-700 text-green-300' : 'bg-gray-700 text-gray-300'}`}
									>
										{m.status}
									</span>
								</td>
								<td className="p-2">{m.power}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
