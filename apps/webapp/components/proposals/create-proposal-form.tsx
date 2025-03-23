'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CreateProposalFormSchema } from '@/lib/schemas/proposals.schemas'
import type { CreateProposalFormValues, ProposalCategory } from '@/lib/types/proposals.types'

interface CreateProposalFormProps {
	onSubmit: (values: CreateProposalFormValues) => void
	onCancel: () => void
}

export function CreateProposalForm({ onSubmit, onCancel }: CreateProposalFormProps) {
	// Initialize React Hook Form with Zod resolver
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<CreateProposalFormValues>({
		resolver: zodResolver(CreateProposalFormSchema),
		defaultValues: {
			title: '',
			category: 'community',
			description: '',
			timeLeft: '7',
		},
	})

	// Watch category value for controlled Select component
	const categoryValue = watch('category')

	// Handle category change
	const handleCategoryChange = (value: string) => {
		setValue('category', value as ProposalCategory, { shouldValidate: true })
	}

	// Handle form submission
	const onSubmitForm = (data: CreateProposalFormValues) => {
		onSubmit(data)
	}

	return (
		<form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="title" className={errors.title ? 'text-red-500' : ''}>
					Title
				</Label>
				<Input
					id="title"
					{...register('title')}
					placeholder="Enter proposal title"
					className={errors.title ? 'border-red-500' : ''}
				/>
				{errors.title && <p className="text-sm font-medium text-red-500">{errors.title.message}</p>}
				<p className="text-sm text-muted-foreground">A clear, concise title for your proposal</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="category" className={errors.category ? 'text-red-500' : ''}>
					Category
				</Label>
				<Select value={categoryValue} onValueChange={handleCategoryChange}>
					<SelectTrigger id="category" className={errors.category ? 'border-red-500' : ''}>
						<SelectValue placeholder="Select a category" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="community">Community</SelectItem>
						<SelectItem value="technical">Technical</SelectItem>
						<SelectItem value="treasury">Treasury</SelectItem>
						<SelectItem value="governance">Governance</SelectItem>
					</SelectContent>
				</Select>
				{errors.category && (
					<p className="text-sm font-medium text-red-500">{errors.category.message}</p>
				)}
				<p className="text-sm text-muted-foreground">
					The category helps members understand the proposal's focus
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description" className={errors.description ? 'text-red-500' : ''}>
					Description
				</Label>
				<Textarea
					id="description"
					{...register('description')}
					placeholder="Describe your proposal in detail..."
					className={`min-h-[120px] resize-y ${errors.description ? 'border-red-500' : ''}`}
				/>
				{errors.description && (
					<p className="text-sm font-medium text-red-500">{errors.description.message}</p>
				)}
				<p className="text-sm text-muted-foreground">
					Provide a detailed explanation of what you're proposing and why
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="timeLeft" className={errors.timeLeft ? 'text-red-500' : ''}>
					Voting Duration (days)
				</Label>
				<Input
					id="timeLeft"
					type="number"
					min="1"
					max="90"
					{...register('timeLeft')}
					placeholder="7"
					className={errors.timeLeft ? 'border-red-500' : ''}
				/>
				{errors.timeLeft && (
					<p className="text-sm font-medium text-red-500">{errors.timeLeft.message}</p>
				)}
				<p className="text-sm text-muted-foreground">
					How many days the proposal will be open for voting (1-90 days)
				</p>
			</div>

			<div className="flex justify-end space-x-2 pt-4">
				<Button type="button" variant="outline" onClick={onCancel} className="font-semibold">
					Cancel
				</Button>
				<Button type="submit" className="font-semibold">
					Save
				</Button>
			</div>
		</form>
	)
}
