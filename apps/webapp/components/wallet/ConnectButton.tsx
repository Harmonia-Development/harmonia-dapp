'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWalletConnection } from '@/lib/wallet/hooks'
import { formatAddress, getNetworkDisplayName, getWalletIcon } from '@/lib/wallet/utils'
import { WalletNetwork } from '@creit.tech/stellar-wallets-kit'
import { ChevronDown, LogOut, Shield, Wallet, Zap } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { WalletSelectionModal } from './wallet-selection-modal'

export function WalletConnectButton() {
	const {
		disconnect,
		switchNetwork,
		isConnected,
		walletAddress,
		walletName,
		selectedWalletId,
		network,
		isConnecting,
		error,
	} = useWalletConnection()

	const [showWalletModal, setShowWalletModal] = useState(false)

	const handleConnect = async () => {
		setShowWalletModal(true)
	}

	const handleDisconnect = async () => {
		const result = await disconnect()
		if (!result.success && result.error) {
			console.error(result.error)
		}
	}

	const handleNetworkSwitch = async (newNetwork: WalletNetwork) => {
		if (newNetwork === network) return

		const result = await switchNetwork(newNetwork)
		if (!result.success && result.error) {
			console.error(result.error)
		}
	}

	const getNetworkIcon = (net: WalletNetwork) => {
		return net === WalletNetwork.PUBLIC ? (
			<Shield className="h-3 w-3" />
		) : (
			<Zap className="h-3 w-3" />
		)
	}

	if (isConnected && walletAddress) {
		return (
			<div className="flex items-center gap-2">
				<Badge variant="outline" className="text-xs">
					{getNetworkIcon(network)}
					{getNetworkDisplayName(network)}
				</Badge>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="gap-2">
							<Image
								src={getWalletIcon(selectedWalletId || 'unknown')}
								alt={walletName || 'Unknown Wallet'}
								width={24}
								height={24}
							/>
							<span className="hidden sm:inline">{formatAddress(walletAddress)}</span>
							<ChevronDown className="h-3 w-3" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<div className="px-2 py-1.5">
							<p className="text-sm font-medium">{walletName}</p>
							<p className="text-xs text-muted-foreground truncate">{walletAddress}</p>
						</div>
						<DropdownMenuSeparator />

						<div className="px-2 py-1.5">
							<p className="text-xs font-medium mb-1">Network</p>
							<div className="space-y-1">
								<DropdownMenuItem
									onClick={() => handleNetworkSwitch(WalletNetwork.TESTNET)}
									className={network === WalletNetwork.TESTNET ? 'bg-accent' : ''}
								>
									<Zap className="h-3 w-3 mr-2" />
									Testnet
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleNetworkSwitch(WalletNetwork.PUBLIC)}
									className={network === WalletNetwork.PUBLIC ? 'bg-accent' : ''}
								>
									<Shield className="h-3 w-3 mr-2" />
									Mainnet
								</DropdownMenuItem>
							</div>
						</div>

						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
							<LogOut className="h-4 w-4 mr-2" />
							Disconnect
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		)
	}

	return (
		<>
			<Button
				onClick={handleConnect}
				disabled={isConnecting}
				className="rounded-full px-4 py-2 text-sm leading-5 gap-2 transition-all duration-300 hover:opacity-90"
			>
				<Wallet className="h-4 w-4" />
				{isConnecting ? 'Connecting…' : 'Connect Wallet'}
			</Button>

			{error && <div className="mt-2 text-xs text-red-500">{error}</div>}

			<WalletSelectionModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
		</>
	)
}
