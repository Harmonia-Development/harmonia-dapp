'use client'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowDownIcon, ArrowUpIcon, BarChart4Icon, PlusIcon, RepeatIcon } from 'lucide-react'
import { useState } from 'react'
import DepositFundsModal from '../modals/DepositFundsModal'
import RebalancePortfolioModal from '../modals/RebalancePortfolioModal'
import SwapAssetsModal from '../modals/SwapAssetsModal'
import TransferFundsModal from '../modals/TransferFundsModal'

export default function AssetManagementPanel() {
	const [activeModal, setActiveModal] = useState<string | null>(null)

	const openModal = (modalName: string) => {
		setActiveModal(modalName)
	}

	const closeModal = () => {
		setActiveModal(null)
	}

	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow">
			<div className="flex flex-row items-center justify-between p-6">
				<div>
					<h3 className="text-xl font-semibold leading-none tracking-tight">Asset Management</h3>
					<p className="text-xs mt-2 text-muted-foreground">Manage treasury assets</p>
				</div>
				<Button variant="default" className="bg-primary hover:bg-primary/90">
					<PlusIcon className="h-4 w-4" />
					Add Asset
				</Button>
			</div>

			<Tabs defaultValue="quick-actions" className="w-full">
				<TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-none">
					<TabsTrigger value="assets" className="rounded-none data-[state=active]:bg-background">
						Assets
					</TabsTrigger>
					<TabsTrigger
						value="quick-actions"
						className="rounded-none data-[state=active]:bg-background"
					>
						Quick Actions
					</TabsTrigger>
				</TabsList>

				<TabsContent value="assets" className="p-4">
					<div className="text-center p-8 text-muted-foreground">
						Asset details will be displayed here
					</div>
				</TabsContent>

				<TabsContent value="quick-actions" className="p-4">
					<div className="grid grid-cols-1 gap-4">
						{/* Deposit Funds */}
						<button
							type="button"
							className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer w-full text-left"
							onClick={() => openModal('deposit')}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
								<ArrowDownIcon className="h-5 w-5" />
							</div>
							<div>
								<h4 className="font-medium">Deposit Funds</h4>
								<p className="text-sm text-muted-foreground">Add assets to the treasury</p>
							</div>
						</button>

						{/* Transfer Funds */}
						<button
							type="button"
							className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer w-full text-left"
							onClick={() => openModal('transfer')}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20">
								<ArrowUpIcon className="h-5 w-5" />
							</div>
							<div>
								<h4 className="font-medium">Transfer Funds</h4>
								<p className="text-sm text-muted-foreground">Send assets to another account</p>
							</div>
						</button>

						{/* Swap Assets */}
						<button
							type="button"
							className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer w-full text-left"
							onClick={() => openModal('swap')}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20">
								<RepeatIcon className="h-5 w-5" />
							</div>
							<div>
								<h4 className="font-medium">Swap Assets</h4>
								<p className="text-sm text-muted-foreground">Exchange one asset for another</p>
							</div>
						</button>

						{/* Rebalance Portfolio */}
						<button
							type="button"
							className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer w-full text-left"
							onClick={() => openModal('rebalance')}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/20">
								<BarChart4Icon className="h-5 w-5" />
							</div>
							<div>
								<h4 className="font-medium">Rebalance Portfolio</h4>
								<p className="text-sm text-muted-foreground">Adjust asset allocation</p>
							</div>
						</button>
					</div>
				</TabsContent>
			</Tabs>

			{/* Modals */}
			<DepositFundsModal isOpen={activeModal === 'deposit'} onClose={closeModal} />

			<TransferFundsModal isOpen={activeModal === 'transfer'} onClose={closeModal} />

			<SwapAssetsModal isOpen={activeModal === 'swap'} onClose={closeModal} />

			<RebalancePortfolioModal isOpen={activeModal === 'rebalance'} onClose={closeModal} />
		</div>
	)
}
