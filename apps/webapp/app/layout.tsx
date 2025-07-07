import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { WalletProvider } from '@/lib/wallet/context'
import { TrustlessWorkProvider } from './trustless-work-provider'
import Header from '@/components/dashboard/Header'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
	title: 'Harmonia DAO',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className="dark">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<TrustlessWorkProvider>
					<WalletProvider>
						<Header />
						{children}
						<Toaster />
					</WalletProvider>
				</TrustlessWorkProvider>
			</body>
		</html>
	)
}
