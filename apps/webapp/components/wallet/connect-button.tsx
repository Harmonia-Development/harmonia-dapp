'use client'

import { Button } from '@/components/ui/button'
import { useWallet } from '@/lib/wallet/context'
import { Loader2 } from 'lucide-react'

export function WalletConnectButton() {
	const { isConnected, address, isLoading, connect, disconnect } = useWallet()

	const handleClick = async () => {
		if (isConnected) {
			await disconnect()
		} else {
			await connect()
		}
	}

	return (
		<Button
			onClick={handleClick}
			disabled={isLoading}
			variant={isConnected ? 'outline' : 'default'}
			className="min-w-[200px] cursor-pointer"
		>
			{isLoading ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					{isConnected ? 'Disconnecting...' : 'Connecting...'}
				</>
			) : isConnected ? (
				`Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}`
			) : (
				'Connect Wallet'
			)}
		</Button>
	)
}
