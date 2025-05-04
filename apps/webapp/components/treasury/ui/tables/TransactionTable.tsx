import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import type { Transaction } from '../../@types/transaction.types'

interface TransactionTableProps {
	transactions: Transaction[]
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
	return (
		<div className="relative w-full overflow-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Transaction</TableHead>
						<TableHead className="text-right">Amount</TableHead>
						<TableHead>Date</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{transactions.map((transaction) => (
						<TableRow key={transaction.id}>
							<TableCell>
								<div className="flex items-center gap-3">
									<Avatar className="h-9 w-9">
										<AvatarImage src="" alt="Usuario" />
										<AvatarFallback className="bg-muted rounded-full text-sm text-muted-foreground">
											{transaction.description.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-medium">{transaction.description}</div>
										<div className="text-xs text-muted-foreground">{transaction.id}</div>
									</div>
								</div>
							</TableCell>
							<TableCell className="text-right">
								<div
									className={`font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-destructive'}`}
								>
									{transaction.amount > 0 ? '+' : ''}
									{transaction.amount} {transaction.currency}
								</div>
							</TableCell>
							<TableCell>
								<div>{transaction.date}</div>
							</TableCell>
							<TableCell>
								<div
									className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
										transaction.status === 'Completed'
											? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-500'
											: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-500'
									}`}
								>
									{transaction.status}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
