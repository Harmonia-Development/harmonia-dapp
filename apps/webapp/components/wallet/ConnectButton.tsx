'use client'

import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'
import { LogOut, Wallet } from 'lucide-react'
import { toast } from 'sonner'

export function WalletConnectButton() {
	const { connectWallet, disconnectWallet, isConnected, walletAddress, isConnecting } = useWallet()

	const handleConnect = async () => {
		const result = await connectWallet()
		if (!result.success && result.error) {
			console.error(result.error)
			toast.error(result.error)
		}
	}

	const handleDisconnect = async () => {
		const result = await disconnectWallet()
		if (!result.success && result.error) {
			console.error(result.error)
			toast.error(result.error)
		}
	}

	const truncateAddress = (addr: string) => `${addr.slice(0, 4)}…${addr.slice(-4)}`

	if (isConnected && walletAddress) {
		return (
			<div className="flex items-center gap-2">
				<Button
					className="rounded-full px-4 py-2 text-sm leading-5 gap-2"
					onClick={handleDisconnect}
				>
					<span>{truncateAddress(walletAddress)}</span>
					<LogOut className="h-3 w-3" />
				</Button>
			</div>
		)
	}

	return (
		<Button
			onClick={handleConnect}
			disabled={isConnecting}
			className="rounded-full px-4 py-2 text-sm leading-5 gap-2 transition-all duration-300 hover:opacity-90"
		>
			<Wallet className="h-4 w-4" />
			{isConnecting ? 'Connecting…' : 'Connect Wallet'}
		</Button>
	)
}
