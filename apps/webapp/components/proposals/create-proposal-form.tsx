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

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input placeholder="Enter proposal title" {...field} />
							</FormControl>
							<FormDescription className="text-sm text-muted-foreground">
								A clear, concise title for your proposal
							</FormDescription>
							<FormMessage className="text-sm font-medium" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="category"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category</FormLabel>
							<Select value={categoryValue} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger>
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
							<FormDescription className="text-sm text-muted-foreground">
								The category helps members understand the proposal's focus
							</FormDescription>
							<FormMessage className="text-sm font-medium" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea
									className="min-h-[120px] resize-y"
									placeholder="Describe your proposal in detail..."
									{...field}
								/>
							</FormControl>
							<FormDescription className="text-sm text-muted-foreground">
								Provide a detailed explanation of what you're proposing and why
							</FormDescription>
							<FormMessage className="text-sm font-medium" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="timeLeft"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Voting Duration (days)</FormLabel>
							<FormControl>
								<Input type="number" min="1" max="90" placeholder="7" {...field} />
							</FormControl>
							<FormDescription className="text-sm text-muted-foreground">
								How many days the proposal will be open for voting (1-90 days)
							</FormDescription>
							<FormMessage className="text-sm font-medium" />
						</FormItem>
					)}
				/>

				<div className="flex justify-end space-x-2 pt-4">
					<Button type="button" variant="outline" onClick={onCancel} className="font-semibold">
						Cancel
					</Button>
					<Button type="submit" className="font-semibold">
						Save
					</Button>
				</div>
			</form>
		</Form>
	)
}
