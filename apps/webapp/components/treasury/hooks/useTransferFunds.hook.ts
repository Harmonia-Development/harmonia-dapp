import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
	type TransferFundsFormValues,
	transferFundsSchema,
} from '../schema/TransferFundsModal.schema'

interface TransferFundsFormProps {
	onClose: () => void
}

export const useTransferFunds = ({ onClose }: TransferFundsFormProps) => {
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

	const form = useForm<TransferFundsFormValues>({
		resolver: zodResolver(transferFundsSchema),
		defaultValues: {
			asset: 'xlm',
			amount: undefined,
			destination: '',
			memo: '',
		},
	})

	const onSubmit = async (data: TransferFundsFormValues) => {
		setIsSubmitting(true)

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000))

		console.log('Form submitted:', data)

		// Reset form and close modal
		form.reset()
		setIsSubmitting(false)
		onClose()
	}

	return { form, isSubmitting, onSubmit }
}
