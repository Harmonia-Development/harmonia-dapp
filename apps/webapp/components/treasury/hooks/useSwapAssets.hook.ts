import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { type SwapAssetsFormValues, swapAssetsSchema } from '../schema/SwapAssetsModal.schema'

const exchangeRates = {
	'xlm-usdc': 0.34,
	'xlm-eth': 0.00018,
	'xlm-btc': 0.000012,
	'usdc-xlm': 2.94,
	'usdc-eth': 0.00053,
	'usdc-btc': 0.000035,
	'eth-xlm': 5555.56,
	'eth-usdc': 1887.79,
	'eth-btc': 0.066,
	'btc-xlm': 83333.33,
	'btc-usdc': 28571.43,
	'btc-eth': 15.15,
}

const assets = [
	{ value: 'xlm', label: 'Stellar Lumens (XLM)', symbol: 'XLM' },
	{ value: 'usdc', label: 'USD Coin (USDC)', symbol: 'USDC' },
	{ value: 'eth', label: 'Ethereum (ETH)', symbol: 'ETH' },
	{ value: 'btc', label: 'Bitcoin (BTC)', symbol: 'BTC' },
]

interface SwapAssetsFormProps {
	onClose: () => void
}

export const useSwapAssets = ({ onClose }: SwapAssetsFormProps) => {
	const [rate, setRate] = useState<number>(0)
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

	const form = useForm<SwapAssetsFormValues>({
		resolver: zodResolver(swapAssetsSchema),
		defaultValues: {
			fromAsset: 'xlm',
			toAsset: 'usdc',
			amount: undefined,
		},
	})

	const fromAsset = form.watch('fromAsset')
	const toAsset = form.watch('toAsset')

	useEffect(() => {
		if (fromAsset && toAsset && fromAsset !== toAsset) {
			const key = `${fromAsset}-${toAsset}` as keyof typeof exchangeRates
			setRate(exchangeRates[key] || 0)
		} else {
			setRate(0)
		}
	}, [fromAsset, toAsset])

	const onSubmit = async (data: SwapAssetsFormValues) => {
		setIsSubmitting(true)

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000))

		console.log('Form submitted:', data)

		// Reset form and close modal
		form.reset()
		setIsSubmitting(false)
		onClose()
	}

	const getSymbol = (value: string) => {
		return assets.find((asset) => asset.value === value)?.symbol || ''
	}

	return { form, rate, isSubmitting, onSubmit, getSymbol }
}
