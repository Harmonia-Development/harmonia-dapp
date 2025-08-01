import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
	type RebalancePortfolioFormValues,
	rebalancePortfolioSchema,
} from '../schema/RebalancePortfolioModal.schema'

interface RebalancePortfolioFormProps {
	onClose: () => void
}

export const useRebalancePortfolio = ({ onClose }: RebalancePortfolioFormProps) => {
	const [total, setTotal] = useState<number>(100)
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

	const form = useForm<RebalancePortfolioFormValues>({
		resolver: zodResolver(rebalancePortfolioSchema),
		defaultValues: {
			xlm: 40,
			usdc: 30,
			eth: 20,
			btc: 10,
		},
	})

	const watchAllFields = form.watch()

	useEffect(() => {
		const newTotal = Object.values(watchAllFields).reduce((sum, value) => sum + (value || 0), 0)
		setTotal(newTotal)
	}, [watchAllFields])

	const onSubmit = async (data: RebalancePortfolioFormValues) => {
		setIsSubmitting(true)

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000))

		console.log('Form submitted:', data)

		// Reset form and close modal
		form.reset()
		setIsSubmitting(false)
		onClose()
	}

	return { form, total, isSubmitting, onSubmit }
}
