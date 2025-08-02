import { WalletNetwork } from '@creit.tech/stellar-wallets-kit'

/**
 * Format a Stellar address for display
 * @param address - The full Stellar address
 * @param startLength - Number of characters to show at the start (default: 6)
 * @param endLength - Number of characters to show at the end (default: 4)
 * @returns Formatted address string
 */
export function formatAddress(address: string, startLength = 6, endLength = 4): string {
	if (!address || address.length < startLength + endLength) {
		return address || 'Unknown'
	}
	return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * Validate a Stellar address format
 * @param address - The address to validate
 * @returns True if the address is valid
 */
export function validateAddress(address: string): boolean {
	if (!address || typeof address !== 'string') return false

	// Stellar addresses are 56 characters long and start with G, M, S, or T
	const stellarAddressRegex = /^[GMS][A-Z2-7]{55}$/
	return stellarAddressRegex.test(address)
}

/**
 * Get explorer URL for a Stellar address
 * @param address - The Stellar address
 * @param network - The network to use for the explorer
 * @returns Explorer URL
 */
export function getExplorerUrl(
	address: string,
	network: WalletNetwork = WalletNetwork.TESTNET,
): string {
	const baseUrl =
		network === WalletNetwork.PUBLIC
			? 'https://stellar.expert/explorer/public/account'
			: 'https://stellar.expert/explorer/testnet/account'

	return `${baseUrl}/${address}`
}

/**
 * Get transaction explorer URL
 * @param txHash - The transaction hash
 * @param network - The network to use for the explorer
 * @returns Explorer URL
 */
export function getTransactionExplorerUrl(
	txHash: string,
	network: WalletNetwork = WalletNetwork.TESTNET,
): string {
	const baseUrl =
		network === WalletNetwork.PUBLIC
			? 'https://stellar.expert/explorer/public/tx'
			: 'https://stellar.expert/explorer/testnet/tx'

	return `${baseUrl}/${txHash}`
}

/**
 * Get network display name
 * @param network - The WalletNetwork enum value
 * @returns Human-readable network name
 */
export function getNetworkDisplayName(network: WalletNetwork): string {
	switch (network) {
		case WalletNetwork.PUBLIC:
			return 'Mainnet'
		case WalletNetwork.TESTNET:
			return 'Testnet'
		case WalletNetwork.FUTURENET:
			return 'Futurenet'
		case WalletNetwork.SANDBOX:
			return 'Sandbox'
		case WalletNetwork.STANDALONE:
			return 'Standalone'
		default:
			return 'Unknown'
	}
}

/**
 * Get network passphrase
 * @param network - The WalletNetwork enum value
 * @returns Network passphrase string
 */
export function getNetworkPassphrase(network: WalletNetwork): string {
	return network
}

/**
 * Check if network is mainnet
 * @param network - The WalletNetwork enum value
 * @returns True if mainnet
 */
export function isMainnet(network: WalletNetwork): boolean {
	return network === WalletNetwork.PUBLIC
}

/**
 * Check if network is testnet
 * @param network - The WalletNetwork enum value
 * @returns True if testnet
 */
export function isTestnet(network: WalletNetwork): boolean {
	return network === WalletNetwork.TESTNET
}

/**
 * Get RPC URL for network
 * @param network - The WalletNetwork enum value
 * @returns RPC URL string
 */
export function getRpcUrl(network: WalletNetwork): string {
	switch (network) {
		case WalletNetwork.PUBLIC:
			return 'https://horizon.stellar.org'
		case WalletNetwork.TESTNET:
			return 'https://horizon-testnet.stellar.org'
		case WalletNetwork.FUTURENET:
			return 'https://horizon-futurenet.stellar.org'
		case WalletNetwork.SANDBOX:
			return 'https://horizon-sandbox.stellar.org'
		case WalletNetwork.STANDALONE:
			return 'http://localhost:8000'
		default:
			return 'https://horizon-testnet.stellar.org'
	}
}

/**
 * Get Soroban RPC URL for network
 * @param network - The WalletNetwork enum value
 * @returns Soroban RPC URL string
 */
export function getSorobanRpcUrl(network: WalletNetwork): string {
	switch (network) {
		case WalletNetwork.PUBLIC:
			return 'https://soroban-mainnet.stellar.org'
		case WalletNetwork.TESTNET:
			return 'https://soroban-testnet.stellar.org'
		case WalletNetwork.FUTURENET:
			return 'https://soroban-futurenet.stellar.org'
		case WalletNetwork.SANDBOX:
			return 'https://soroban-sandbox.stellar.org'
		case WalletNetwork.STANDALONE:
			return 'http://localhost:8000'
		default:
			return 'https://soroban-testnet.stellar.org'
	}
}

/**
 * Convert network string to WalletNetwork enum
 * @param networkString - Network string ('mainnet', 'testnet', etc.)
 * @returns WalletNetwork enum value
 */
export function stringToWalletNetwork(networkString: string): WalletNetwork {
	switch (networkString.toLowerCase()) {
		case 'mainnet':
		case 'public':
			return WalletNetwork.PUBLIC
		case 'testnet':
			return WalletNetwork.TESTNET
		case 'futurenet':
			return WalletNetwork.FUTURENET
		case 'sandbox':
			return WalletNetwork.SANDBOX
		case 'standalone':
			return WalletNetwork.STANDALONE
		default:
			return WalletNetwork.TESTNET
	}
}

/**
 * Convert WalletNetwork enum to string
 * @param network - WalletNetwork enum value
 * @returns Network string
 */
export function walletNetworkToString(network: WalletNetwork): string {
	switch (network) {
		case WalletNetwork.PUBLIC:
			return 'mainnet'
		case WalletNetwork.TESTNET:
			return 'testnet'
		case WalletNetwork.FUTURENET:
			return 'futurenet'
		case WalletNetwork.SANDBOX:
			return 'sandbox'
		case WalletNetwork.STANDALONE:
			return 'standalone'
		default:
			return 'testnet'
	}
}

/**
 * Get wallet icon by wallet ID
 * @param walletId - The wallet identifier
 * @returns SVG file path or default
 */
export function getWalletIcon(walletId: string): string {
	const walletIcons: Record<string, string> = {
		freighter: '/freighter.png',
		xbull: '/xbull-dark.svg',
		lobstr: '/lobstr.png',
		hot: '/hot.svg',
		albedo: '/albedo.svg',
		rabet: '/rabet.svg',
		walletconnect: '/walletconnect.svg',
	}

	return walletIcons[walletId.toLowerCase()] || '/default-wallet.svg'
}

/**
 * Get wallet display name
 * @param walletId - The wallet identifier
 * @returns Human-readable wallet name
 */
export function getWalletDisplayName(walletId: string): string {
	const walletNames: Record<string, string> = {
		freighter: 'Freighter',
		xbull: 'xBull',
		lobstr: 'Lobstr',
		hot: 'Hot Wallet',
		albedo: 'Albedo',
		rabet: 'Rabet',
		walletconnect: 'WalletConnect',
	}

	return walletNames[walletId.toLowerCase()] || 'Unknown Wallet'
}
