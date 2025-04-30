import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTransferFunds } from '../../hooks/useTransferFunds.hook'

interface TransferFundsFormProps {
	onClose: () => void
}

const assets = [
	{ value: 'xlm', label: 'Stellar Lumens (XLM)' },
	{ value: 'usdc', label: 'USD Coin (USDC)' },
	{ value: 'eth', label: 'Ethereum (ETH)' },
	{ value: 'btc', label: 'Bitcoin (BTC)' },
]

export const TransferFundsForm = ({ onClose }: TransferFundsFormProps) => {
	const { form, isSubmitting, onSubmit } = useTransferFunds({ onClose })

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="asset"
					render={({ field }) => (
						<FormItem className="grid grid-cols-3 items-center gap-4">
							<FormLabel className="text-center">Asset</FormLabel>
							<div className="col-span-2">
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger className="bg-background border-input">
											<SelectValue placeholder="Select asset" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{assets.map((asset) => (
											<SelectItem key={asset.value} value={asset.value}>
												{asset.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</div>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="amount"
					render={({ field }) => (
						<FormItem className="grid grid-cols-3 items-center gap-4">
							<FormLabel className="text-center">Amount</FormLabel>
							<div className="col-span-2">
								<FormControl>
									<Input
										type="number"
										placeholder="0.00"
										{...field}
										className="bg-background border-input"
									/>
								</FormControl>
								<FormMessage />
							</div>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="destination"
					render={({ field }) => (
						<FormItem className="grid grid-cols-3 items-center gap-4">
							<FormLabel className="text-center">Destination</FormLabel>
							<div className="col-span-2">
								<FormControl>
									<Input
										placeholder="Enter wallet address"
										{...field}
										className="bg-background border-input"
									/>
								</FormControl>
								<FormMessage />
							</div>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="memo"
					render={({ field }) => (
						<FormItem className="grid grid-cols-3 items-center gap-4">
							<FormLabel className="text-center">Memo</FormLabel>
							<div className="col-span-2">
								<FormControl>
									<Textarea
										placeholder="Optional memo"
										{...field}
										className="bg-background border-input resize-none"
									/>
								</FormControl>
								<FormMessage />
							</div>
						</FormItem>
					)}
				/>

				<div className="flex justify-end gap-2 pt-4">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isSubmitting}
						className="bg-purple-600 hover:bg-purple-700"
					>
						{isSubmitting ? 'Processing...' : 'Transfer'}
					</Button>
				</div>
			</form>
		</Form>
	)
}
