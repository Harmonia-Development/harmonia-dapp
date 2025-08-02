'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useWalletConnection } from '@/lib/wallet/hooks'
import { getNetworkDisplayName, getWalletIcon } from '@/lib/wallet/utils'
import { WalletNetwork } from '@creit.tech/stellar-wallets-kit'
import { ExternalLink, Globe, Shield, Zap } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface WalletSelectionModalProps {
	isOpen: boolean
	onClose: () => void
}

export function WalletSelectionModal({ isOpen, onClose }: WalletSelectionModalProps) {
	const { connectWallet, switchNetwork, network, isConnecting } = useWalletConnection()

	const [selectedNetwork, setSelectedNetwork] = useState<WalletNetwork>(network)
	const [isNetworkSwitching, setIsNetworkSwitching] = useState(false)

	// Update selected network when context network changes
	useEffect(() => {
		setSelectedNetwork(network)
	}, [network])

	const handleNetworkSwitch = async (newNetwork: WalletNetwork) => {
		if (newNetwork === selectedNetwork) return

		setIsNetworkSwitching(true)
		try {
			await switchNetwork(newNetwork)
			setSelectedNetwork(newNetwork)
		} catch (error) {
			console.error('Failed to switch network:', error)
		} finally {
			setIsNetworkSwitching(false)
		}
	}

	const handleWalletConnect = async (walletId: string) => {
		try {
			const result = await connectWallet(walletId)
			if (result.success) {
				onClose()
			}
		} catch (error) {
			console.error('Failed to connect wallet:', error)
		}
	}

	// The kit handles wallet availability automatically, so we just show a simple interface
	const allWallets = [
		{
			id: 'freighter',
			name: 'Freighter',
			description: 'Browser extension wallet',
		},
		{
			id: 'xbull',
			name: 'xBull',
			description: 'Mobile wallet with advanced features',
		},
		{ id: 'lobstr', name: 'Lobstr', description: 'Simple and secure wallet' },
		{ id: 'hot', name: 'Hot Wallet', description: 'Web-based wallet' },
	]

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px] h-[90vh] p-0 flex flex-col">
				<DialogHeader className="p-6 border-b">
					<DialogTitle className="flex items-center gap-2">
						<Globe className="h-5 w-5" />
						Connect Stellar Wallet
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 px-6 pt-2">
					{/* Network Selection */}
					<div className="space-y-2">
						<span className="text-sm font-medium">Network</span>
						<div className="flex gap-2">
							<Button
								variant={selectedNetwork === WalletNetwork.TESTNET ? 'default' : 'outline'}
								size="sm"
								onClick={() => handleNetworkSwitch(WalletNetwork.TESTNET)}
								disabled={isNetworkSwitching}
								className="flex-1"
							>
								<Zap className="h-4 w-4 mr-2" />
								Testnet
							</Button>
							<Button
								variant={selectedNetwork === WalletNetwork.PUBLIC ? 'default' : 'outline'}
								size="sm"
								onClick={() => handleNetworkSwitch(WalletNetwork.PUBLIC)}
								disabled={isNetworkSwitching}
								className="flex-1"
							>
								<Shield className="h-4 w-4 mr-2" />
								Mainnet
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							Current: {getNetworkDisplayName(selectedNetwork)}
						</p>
					</div>

					<Separator />

					{/* Wallet Selection */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-medium">Available Wallets</h3>
							<Badge variant="secondary" className="text-xs">
								{allWallets.length} supported
							</Badge>
						</div>

						<div className="space-y-2">
							{allWallets.map((wallet) => (
								<Button
									key={wallet.id}
									variant="outline"
									className="w-full justify-start h-auto p-4"
									onClick={() => handleWalletConnect(wallet.id)}
									disabled={isConnecting}
								>
									<div className="flex items-center gap-3 w-full">
										<Image
											src={getWalletIcon(wallet.id)}
											alt={wallet.name}
											width={24}
											height={24}
										/>
										<div className="flex-1 text-left">
											<div className="font-medium">{wallet.name}</div>
											<div className="text-xs text-muted-foreground">{wallet.description}</div>
										</div>
										<ExternalLink className="h-4 w-4 text-muted-foreground" />
									</div>
								</Button>
							))}
						</div>
					</div>

					<Separator />
					<div className="space-y-2">
						<h3 className="text-sm font-medium">Need Help?</h3>
						<div className="text-xs text-muted-foreground space-y-1">
							<p>• Install a Stellar wallet extension like Freighter</p>
							<p>• Make sure your wallet supports the selected network</p>
							<p>• For testnet, you can get free XLM from the faucet</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
