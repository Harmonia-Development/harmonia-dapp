'use client'

import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

interface WalletContextType {
	address: string | null
	name: string | null
	connected: boolean
	connect: (address: string, name: string) => void
	disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
	const [address, setAddress] = useState<string | null>(null)
	const [name, setName] = useState<string | null>(null)
	const [connected, setConnected] = useState(false)

	useEffect(() => {
		// Check if wallet was connected in a previous session
		const savedAddress = localStorage.getItem('stellarWalletAddress')
		const savedName = localStorage.getItem('stellarWalletName')

		if (savedAddress && savedName) {
			setAddress(savedAddress)
			setName(savedName)
			setConnected(true)
		}
	}, [])

	const connect = (address: string, name: string) => {
		setAddress(address)
		setName(name)
		setConnected(true)
		localStorage.setItem('stellarWalletAddress', address)
		localStorage.setItem('stellarWalletName', name)
	}

	const disconnect = () => {
		setAddress(null)
		setName(null)
		setConnected(false)
		localStorage.removeItem('stellarWalletAddress')
		localStorage.removeItem('stellarWalletName')
	}

	return (
		<WalletContext.Provider value={{ address, name, connected, connect, disconnect }}>
			{children}
		</WalletContext.Provider>
	)
}

export function useWalletContext() {
	const context = useContext(WalletContext)
	if (context === undefined) {
		throw new Error('useWalletContext must be used within a WalletProvider')
	}
	return context
}
