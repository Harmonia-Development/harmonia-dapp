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
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useSwapAssets } from '../../hooks/useSwapAssets.hook'

interface SwapAssetsFormProps {
	onClose: () => void
}

const assets = [
	{ value: 'xlm', label: 'Stellar Lumens (XLM)', symbol: 'XLM' },
	{ value: 'usdc', label: 'USD Coin (USDC)', symbol: 'USDC' },
	{ value: 'eth', label: 'Ethereum (ETH)', symbol: 'ETH' },
	{ value: 'btc', label: 'Bitcoin (BTC)', symbol: 'BTC' },
]

export const SwapAssetsForm = ({ onClose }: SwapAssetsFormProps) => {
	const { form, rate, isSubmitting, onSubmit, getSymbol } = useSwapAssets({
		onClose,
	})

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="fromAsset"
					render={({ field }) => (
						<FormItem className="grid grid-cols-3 items-center gap-4">
							<FormLabel className="text-center">From</FormLabel>
							<div className="col-span-2">
								<Select
									onValueChange={(value) => {
										const toAsset = form.getValues('toAsset')
										const fromAsset = field.value
										if (value === toAsset) {
											form.setValue('toAsset', fromAsset)
										}
										field.onChange(value)
									}}
									defaultValue={field.value}
								>
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
					name="toAsset"
					render={({ field }) => (
						<FormItem className="grid grid-cols-3 items-center gap-4">
							<FormLabel className="text-center">To</FormLabel>
							<div className="col-span-2">
								<Select
									onValueChange={(value) => {
										if (value === form.getValues('fromAsset')) {
											form.setValue('fromAsset', form.getValues('toAsset'))
										}
										field.onChange(value)
									}}
									defaultValue={field.value}
								>
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

				<div className="grid grid-cols-3 items-center gap-4">
					<Label className="text-center">Rate</Label>
					<div className="col-span-2 text-sm text-muted-foreground">
						1 {getSymbol(form.getValues('fromAsset'))} = {rate}{' '}
						{getSymbol(form.getValues('toAsset'))} (Market Rate)
					</div>
				</div>

				<div className="flex justify-end gap-2 pt-4">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isSubmitting}
						className="bg-purple-600 hover:bg-purple-700"
					>
						{isSubmitting ? 'Processing...' : 'Swap'}
					</Button>
				</div>
			</form>
		</Form>
	)
}
