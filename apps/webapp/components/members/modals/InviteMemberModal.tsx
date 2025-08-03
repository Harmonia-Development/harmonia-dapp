'use client'

import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { memberInvitationSchema } from '@/lib/schemas/validation.schemas'
import { logDev } from '@/lib/utils/logger'
import { sanitizeEmail, sanitizeString } from '@/lib/utils/sanitize'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Copy, Link, Mail, MessageCircle, Timer, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

type InviteFormValues = z.infer<typeof memberInvitationSchema>

const defaultValues: InviteFormValues = {
	email: '',
	role: 'member',
	message: '',
	referralCode: '',
	expiresIn: '7d',
}

// Generate a random referral code
function generateReferralCode(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	let result = ''
	for (let i = 0; i < 8; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return result
}
interface InviteMemberModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function InviteMemberModal({ open, onOpenChange }: InviteMemberModalProps) {
	const [activeTab, setActiveTab] = useState('create')
	const [copied, setCopied] = useState(false)

	const form = useForm<InviteFormValues>({
		resolver: zodResolver(memberInvitationSchema),
		defaultValues,
	})

	function onSubmit(data: InviteFormValues) {
		// Sanitize inputs before processing
		const sanitizedData = {
			...data,
			email: sanitizeEmail(data.email),
			message: data.message ? sanitizeString(data.message) : '',
			referralCode: sanitizeString(data.referralCode),
		}

		logDev('Invitation data:', sanitizedData)

		toast.success(`Invitation sent to ${sanitizedData.email}`)

		// Reset form and close modal
		form.reset(defaultValues)
		onOpenChange(false)
	}

	function regenerateCode() {
		const newCode = generateReferralCode()
		form.setValue('referralCode', newCode)
	}

	function copyInviteLink(onlyCode = false) {
		if (onlyCode) {
			navigator.clipboard.writeText(form.getValues('referralCode'))
			setCopied(true)
			setTimeout(() => {
				setCopied(false)
			}, 2000)
			return
		}

		// In a real app, this would be a real invite link
		const inviteLink = `http://localhost:3000/invite/${form.getValues('referralCode')}`
		navigator.clipboard.writeText(inviteLink)
		setCopied(true)

		setTimeout(() => {
			setCopied(false)
		}, 2000)
	}

	return (
		<ErrorBoundary>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Invite New Member</DialogTitle>
						<DialogDescription>
							Send invitations to new members or generate referral codes
						</DialogDescription>
					</DialogHeader>

					<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="create">Create Invitation</TabsTrigger>
							<TabsTrigger value="referral">Referral Code</TabsTrigger>
						</TabsList>

						<TabsContent value="create" className="space-y-4">
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<Mail className="h-4 w-4" />
													Email Address
												</FormLabel>
												<FormControl>
													<Input placeholder="member@example.com" type="email" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="role"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<User className="h-4 w-4" />
													Role
												</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select a role" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="member">Member</SelectItem>
														<SelectItem value="moderator">Moderator</SelectItem>
														<SelectItem value="admin">Admin</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="message"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<MessageCircle className="h-4 w-4" />
													Personal Message (Optional)
												</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Add a personal message to your invitation..."
														className="min-h-[80px]"
														maxLength={500}
														{...field}
													/>
												</FormControl>
												<FormDescription>{field.value?.length || 0}/500 characters</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="expiresIn"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<Timer className="h-4 w-4" />
													Expiration
												</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select expiration" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="1d">1 Day</SelectItem>
														<SelectItem value="7d">7 Days</SelectItem>
														<SelectItem value="30d">30 Days</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="flex justify-end space-x-2 pt-4">
										<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
											Cancel
										</Button>
										<Button type="submit">Send Invitation</Button>
									</div>
								</form>
							</Form>
						</TabsContent>

						<TabsContent value="referral" className="space-y-4">
							<div className="space-y-4">
								<div>
									<label
										htmlFor="referralCode"
										className="text-sm font-medium flex items-center gap-2"
									>
										<Link className="h-4 w-4" />
										Referral Code
									</label>
									<div className="flex gap-2 mt-2">
										<Input
											id="referralCode"
											value={form.getValues('referralCode')}
											readOnly
											className="font-mono"
										/>
										<Button type="button" variant="outline" size="icon" onClick={regenerateCode}>
											<User className="h-4 w-4" />
										</Button>
									</div>
								</div>

								<div className="flex gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => copyInviteLink(false)}
										className="flex-1"
									>
										{copied ? (
											<>
												<Check className="h-4 w-4 mr-2" />
												Copied!
											</>
										) : (
											<>
												<Copy className="h-4 w-4 mr-2" />
												Copy Invite Link
											</>
										)}
									</Button>
									<Button type="button" variant="outline" onClick={() => copyInviteLink(true)}>
										Copy Code
									</Button>
								</div>

								<div className="text-sm text-muted-foreground">
									Share this referral code with potential members. They can use it to join the DAO.
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</DialogContent>
			</Dialog>
		</ErrorBoundary>
	)
}
