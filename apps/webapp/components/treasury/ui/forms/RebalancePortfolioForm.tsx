import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRebalancePortfolio } from '../../hooks/useRebalancePortfolio.hook'
import type { RebalancePortfolioFormValues } from '../../schema/RebalancePortfolioModal.schema'

const assets = [
	{ id: 'xlm', name: 'Stellar Lumens (XLM)', color: 'bg-blue-500' },
	{ id: 'usdc', name: 'USD Coin (USDC)', color: 'bg-green-500' },
	{ id: 'eth', name: 'Ethereum (ETH)', color: 'bg-purple-500' },
	{ id: 'btc', name: 'Bitcoin (BTC)', color: 'bg-amber-500' },
]

interface RebalancePortfolioFormProps {
	onClose: () => void
}

export const RebalancePortfolioForm = ({ onClose }: RebalancePortfolioFormProps) => {
	const { form, total, isSubmitting, onSubmit } = useRebalancePortfolio({
		onClose,
	})

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				{assets.map((asset) => (
					<FormField
						key={asset.id}
						control={form.control}
						name={asset.id as keyof RebalancePortfolioFormValues}
						render={({ field }) => (
							<FormItem className="flex items-center gap-4">
								<div className="w-3/4 text-center flex items-center justify-start gap-2">
									<div className={`w-3 h-3 ${asset.color} rounded-full`} />

									<Label htmlFor={asset.id}>{asset.name}</Label>
								</div>
								<div className="w-1/4 flex items-center gap-2">
									<FormControl>
										<Input
											id={asset.id}
											type="number"
											min="0"
											max="100"
											{...field}
											className="bg-background border-input h-9"
										/>
									</FormControl>
									<span className="text-sm">%</span>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
				))}

				<div className="flex items-center gap-4 pt-2 border-t">
					<div className="text-start font-medium">Total:</div>
					<div className={`font-medium ${total !== 100 ? 'text-destructive' : ''}`}>
						{total}% {total !== 100 ? '(Must equal 100%)' : ''}
					</div>
				</div>

				<div className="flex justify-end gap-2 pt-4">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isSubmitting || total !== 100}
						className="bg-purple-600 hover:bg-purple-700"
					>
						{isSubmitting ? 'Processing...' : 'Rebalance'}
					</Button>
				</div>
			</form>
		</Form>
	)
}
