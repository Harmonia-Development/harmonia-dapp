import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'

export interface Proposal {
	id: string
	title: string
	summary: string
	category: string
	status: 'active' | 'passed' | 'rejected' | 'pending'
	votes: {
		for: number
		against: number
		abstain: number
	}
	startDate: string
	endDate: string
}

interface ProposalItemCardProps {
	proposal: Proposal
}

export function ProposalItemCard({ proposal }: ProposalItemCardProps) {
	const { title, summary, category, status, votes, startDate, endDate } = proposal

	// Calculate vote percentages
	const totalVotes = votes.for + votes.against + votes.abstain
	const forPercentage = totalVotes > 0 ? (votes.for / totalVotes) * 100 : 0
	const againstPercentage = totalVotes > 0 ? (votes.against / totalVotes) * 100 : 0
	const abstainPercentage = totalVotes > 0 ? (votes.abstain / totalVotes) * 100 : 0

	// Status color mapping
	// const statusColorMap = {
	//   active: "bg-blue-500",
	//   passed: "bg-green-500",
	//   rejected: "bg-red-500",
	//   pending: "bg-yellow-500"
	// };

	return (
		<Card className="mb-4 hover:shadow-md transition-shadow">
			<CardHeader className="pb-2">
				<div className="flex justify-between items-start">
					<h3 className="text-lg font-semibold">{title}</h3>
					<Badge variant="outline" className="capitalize">
						{category}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="pb-2">
				<p className="text-sm text-muted-foreground mb-4">{summary}</p>

				{/* Voting progress bars */}
				<div className="space-y-2 mb-4">
					<div className="flex items-center justify-between text-xs">
						<span>For</span>
						<span>{forPercentage.toFixed(1)}%</span>
					</div>
					<div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
						<div className="h-full bg-green-500" style={{ width: `${forPercentage}%` }} />
					</div>

					<div className="flex items-center justify-between text-xs">
						<span>Against</span>
						<span>{againstPercentage.toFixed(1)}%</span>
					</div>
					<div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
						<div className="h-full bg-red-500" style={{ width: `${againstPercentage}%` }} />
					</div>

					<div className="flex items-center justify-between text-xs">
						<span>Abstain</span>
						<span>{abstainPercentage.toFixed(1)}%</span>
					</div>
					<div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
						<div className="h-full bg-gray-500" style={{ width: `${abstainPercentage}%` }} />
					</div>
				</div>
			</CardContent>

			<CardFooter className="pt-0 text-xs text-muted-foreground">
				<div className="w-full flex justify-between items-center">
					<div className="flex items-center gap-4">
						<div className="flex items-center">
							<Calendar className="h-3 w-3 mr-1" />
							<span>
								{new Date(startDate).toLocaleDateString()} -{' '}
								{new Date(endDate).toLocaleDateString()}
							</span>
						</div>
						<div className="flex items-center">
							<Clock className="h-3 w-3 mr-1" />
							<Badge variant="secondary" className="text-xs capitalize">
								{status}
							</Badge>
						</div>
					</div>
				</div>
			</CardFooter>
		</Card>
	)
}
