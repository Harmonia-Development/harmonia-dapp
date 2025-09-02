import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/common/Header'
import { Toaster } from '@/components/ui/sonner'
import { TrustlessWorkProvider } from '@/lib/trustless-work/provider'
import { GoogleAnalytics } from '@next/third-parties/google'
import { ReactQueryClientProvider } from '@packages/lib/providers'
import { WalletProvider } from '../hooks/context/useWalletContext'

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
				<ReactQueryClientProvider>
					<WalletProvider>
						<TrustlessWorkProvider>
							<Header />
							{children}
							<Toaster />
						</TrustlessWorkProvider>
					</WalletProvider>
				</ReactQueryClientProvider>
				<GoogleAnalytics gaId="G-YHNFJFWVCG" />
			</body>
		</html>
	)
}
