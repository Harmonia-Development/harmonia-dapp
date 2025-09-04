import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { Coins, Dot, SquareCheck, UserPlus } from 'lucide-react'

export type NotificationType = 'proposal' | 'treasury' | 'member'

export interface NotificationItemProps {
	id: string
	type: NotificationType
	message: string
	timestamp: string
	unread: boolean
	className?: string
	onToggleRead?: (id: string) => void
}

const TYPE_META: Record<NotificationType, { title: string; icon: LucideIcon; chipClass: string }> =
	{
		proposal: {
			title: 'Proposal Ending Soon',
			icon: SquareCheck,
			chipClass: 'bg-white/10 text-white',
		},
		treasury: {
			title: 'Treasury Update',
			icon: Coins,
			chipClass: 'bg-blue-500/20 text-blue-200',
		},
		member: {
			title: 'New Member Joined',
			icon: UserPlus,
			chipClass: 'bg-purple-500/20 text-purple-200',
		},
	}

export function NotificationItem({
	id,
	type,
	message,
	timestamp,
	unread,
	className,
	onToggleRead,
}: NotificationItemProps) {
	const meta = TYPE_META[type]
	const Icon = meta.icon

	return (
		<button
			type="button"
			aria-pressed={!unread}
			onClick={() => onToggleRead?.(id)}
			className={cn(
				'w-full text-left rounded-xl px-4 py-3 transition-colors appearance-none focus:outline-none',
				'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
				unread
					? 'border border-primary/20 bg-primary/10 hover:bg-primary/[0.05]'
					: 'border border-white/10 bg-white/[0.03] hover:bg-white/[0.05]',
				'flex items-start gap-3',
				className,
			)}
		>
			<div
				className={cn(
					'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-white/5',
					meta.chipClass,
				)}
			>
				<Icon className="h-4 w-4" />
			</div>

			<div className="min-w-0 flex-1">
				<div className="relative mb-1 flex items-center pr-10">
					<p className="text-sm font-medium text-white">{meta.title}</p>
					{unread && (
						<Dot
							className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 text-primary pointer-events-none"
							aria-hidden
						/>
					)}
				</div>

				<p className="text-sm text-white/80">{message}</p>
				<p className="mt-1 text-xs text-white/50">{timestamp}</p>
			</div>
		</button>
	)
}
