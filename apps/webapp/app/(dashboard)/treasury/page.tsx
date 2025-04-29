import Header from '@/components/dashboard/Header'
import { AddToTreasuryButton } from '@/components/treasury/AddToTreasuryButton'
import { AssetAllocationChart } from '@/components/treasury/AssetAllocationChart'
import { TreasuryGrowthChart } from '@/components/treasury/TreasuryGrowthChart'
import { TreasuryStats } from '@/components/treasury/TreasuryStats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
export default function TreasuryPage() {
	return (
		<>
			<Header />
			<div className="container mx-auto py-6">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
					<h1 className="text-2xl font-bold">Treasury Dashboard</h1>
					<AddToTreasuryButton />
				</div>

				<div className="grid gap-6">
					<TreasuryStats />

					<TreasuryGrowthChart />

					<div className="grid gap-6 md:grid-cols-2">
						<AssetAllocationChart />

						<Card className="col-span-1">
							<CardHeader>
								<CardTitle>Recent Transactions</CardTitle>
							</CardHeader>
							<CardContent>
								{/* We could add a simple list of recent transactions here */}
								<p className="text-muted-foreground">
									Recent transaction history will be displayed here.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</>
	)
}
