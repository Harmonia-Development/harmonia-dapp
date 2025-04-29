'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { ArrowRight, DiscIcon as Discord, Github, Twitter } from 'lucide-react'
import { useState } from 'react'
import { WalletConnectButton } from '@/components/wallet/connect-button'

export default function Home() {
	const [email, setEmail] = useState('')

	// Calculate time until launch (example: March 1st, 2025)
	const launchDate = new Date('2025-03-01').getTime()
	const now = new Date().getTime()
	const distance = launchDate - now
	const days = Math.floor(distance / (1000 * 60 * 60 * 24))

	return (
		<main className="min-h-screen relative overflow-hidden bg-[#070B1D]">
			{/* Background gradient */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />

			{/* Floating elements */}
			<div className="absolute inset-0 overflow-hidden">
				{[...Array(3)].map((_, i) => (
					<motion.div
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={i}
						className="absolute w-[300px] h-[300px] rounded-full bg-blue-500/10"
						animate={{
							x: [0, 100, 0],
							y: [0, 50, 0],
							scale: [1, 1.1, 1],
						}}
						transition={{
							duration: 15,
							repeat: Number.POSITIVE_INFINITY,
							delay: i * 2,
						}}
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
						}}
					/>
				))}
			</div>

			<div className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen gap-12">
				{/* Main content */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="max-w-4xl mx-auto text-center space-y-8"
				>
					<div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full backdrop-blur-sm border border-blue-500/20 text-blue-300 mb-4">
						{days} days until launch
					</div>

					<h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8">
						Coming Soon{' '}
						<span className="bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#93C5FD] text-transparent bg-clip-text">
							Harmonia DAO Management
						</span>
					</h1>

					<p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
						Decentralized DAO board management tool built on Stellar.
					</p>

					{/* Newsletter signup */}
					<div className="max-w-md mx-auto mt-12">
						<div className="flex gap-2">
							<Input
								type="email"
								placeholder="Enter your email"
								className="bg-white/5 border-white/10"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<Button className="bg-blue-600 hover:bg-blue-700">
								Notify Me <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
						<p className="text-sm text-gray-500 mt-2">Be the first to know when we launch</p>
					</div>


				</motion.div>

				{/* Social links */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.4 }}
					className="flex gap-6 mt-12"
				>
					{[
						{ icon: Discord, label: 'Discord' },
						{ icon: Twitter, label: 'Twitter' },
						{ icon: Github, label: 'Github' },
					].map((social, i) => (
						<Button
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							key={i}
							variant="ghost"
							size="icon"
							className="text-gray-400 hover:text-white hover:bg-white/10"
						>
							<social.icon className="h-5 w-5" />
							<span className="sr-only">{social.label}</span>
						</Button>
					))}
				</motion.div>
			</div>
		</main>
	)
}
