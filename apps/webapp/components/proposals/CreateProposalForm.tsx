'use client'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormDescription,
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
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { CreateProposalFormSchema } from '@/lib/schemas/proposals.schemas'
import type { CreateProposalFormValues } from '@/lib/types/proposals.types'
import { sanitizeString } from '@/lib/utils/sanitize'

interface CreateProposalFormProps {
	onSubmit: (values: CreateProposalFormValues) => void
	onCancel: () => void
}

export function CreateProposalForm({ onSubmit, onCancel }: CreateProposalFormProps) {
	const form = useForm<CreateProposalFormValues>({
		resolver: zodResolver(CreateProposalFormSchema),
		defaultValues: {
			title: '',
			category: 'community',
			description: '',
			timeLeft: '7',
		},
	})

	const categoryValue = form.watch('category')

	const handleSubmit = (values: CreateProposalFormValues) => {
		// Sanitize inputs before submission
		const sanitizedValues = {
			...values,
			title: sanitizeString(values.title),
			description: sanitizeString(values.description),
		}

		onSubmit(sanitizedValues)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm sm:text-base">Title</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter proposal title"
									{...field}
									maxLength={100}
									className="text-sm sm:text-base"
								/>
							</FormControl>
							<FormDescription className="text-xs sm:text-sm text-muted-foreground">
								A clear, concise title for your proposal (max 100 characters)
							</FormDescription>
							<FormMessage className="text-red-500 text-sm font-medium" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="category"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm sm:text-base">Category</FormLabel>
							<Select value={categoryValue} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger className="text-sm sm:text-base">
										<SelectValue placeholder="Select a category" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="community">Community</SelectItem>
									<SelectItem value="technical">Technical</SelectItem>
									<SelectItem value="treasury">Treasury</SelectItem>
									<SelectItem value="governance">Governance</SelectItem>
								</SelectContent>
							</Select>
							<FormDescription className="text-xs sm:text-sm text-muted-foreground">
								The category helps members understand the proposal&apos;s focus
							</FormDescription>
							<FormMessage className="text-red-500 text-sm font-medium" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm sm:text-base">Description</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Describe your proposal in detail..."
									className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
									{...field}
									maxLength={1000}
								/>
							</FormControl>
							<FormDescription className="text-xs sm:text-sm text-muted-foreground">
								Provide a detailed explanation of your proposal (max 1000 characters)
							</FormDescription>
							<FormMessage className="text-red-500 text-sm font-medium" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="timeLeft"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm sm:text-base">Voting Duration (days)</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="7"
									min="1"
									max="90"
									{...field}
									className="text-sm sm:text-base"
								/>
							</FormControl>
							<FormDescription className="text-xs sm:text-sm text-muted-foreground">
								How long should voting be open? (1-90 days)
							</FormDescription>
							<FormMessage className="text-red-500 text-sm font-medium" />
						</FormItem>
					)}
				/>

				<div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6">
					<Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
						Cancel
					</Button>
					<Button type="submit" className="w-full sm:w-auto">
						Create Proposal
					</Button>
				</div>
			</form>
		</Form>
	)
}
