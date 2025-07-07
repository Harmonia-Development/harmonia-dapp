import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { logDev } from '@/lib/utils/logger'
import * as Dialog from '@radix-ui/react-dialog'
import * as Switch from '@radix-ui/react-switch'
import * as Tabs from '@radix-ui/react-tabs'
import { Calendar, PlusIcon, X } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'

const AddToTreasuryModal: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [currentTab, setCurrentTab] = useState('transaction-details')

	// Form state
	const [formData, setFormData] = useState({
		amount: '',
		asset: 'XLM',
		transactionType: 'Deposit',
		sourceAddress: '',
		destinationAddress: '',
		memo: '',
		referenceId: '',
		requireMultiSig: false,
		scheduleTransaction: false,
		scheduledDateTime: '',
		recurringTransaction: false,
		recurringFrequency: 'Weekly',
	})

	// Validation state
	const [errors, setErrors] = useState({
		amount: '',
		asset: '',
		sourceAddress: '',
		destinationAddress: '',
	})

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))

		// Clear error when field is edited
		if (name in errors) {
			setErrors((prev) => ({ ...prev, [name]: '' }))
		}
	}

	const handleSwitchChange = (name: string, checked: boolean) => {
		setFormData((prev) => ({ ...prev, [name]: checked }))
	}

	const validateForm = () => {
		const newErrors = {
			amount: !formData.amount ? 'Amount is required' : '',
			asset: !formData.asset ? 'Asset is required' : '',
			sourceAddress: !formData.sourceAddress ? 'Source address is required' : '',
			destinationAddress: !formData.destinationAddress ? 'Destination address is required' : '',
		}

		setErrors(newErrors)
		return !Object.values(newErrors).some((error) => error)
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (validateForm()) {
			logDev('Form submitted with data:', formData)
			// Here you would handle the actual submission logic
			setIsOpen(false)
			// Reset form after submission
			setFormData({
				amount: '',
				asset: 'XLM',
				transactionType: 'Deposit',
				sourceAddress: '',
				destinationAddress: '',
				memo: '',
				referenceId: '',
				requireMultiSig: false,
				scheduleTransaction: false,
				scheduledDateTime: '',
				recurringTransaction: false,
				recurringFrequency: 'Weekly',
			})
		}
	}

	return (
		<ErrorBoundary>
			<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
				<Dialog.Trigger asChild>
					<Button className="bg-primary hover:bg-primary/90">
						<PlusIcon className="mr-2 h-4 w-4" />
						Add to Treasury
					</Button>
				</Dialog.Trigger>

				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
					<Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[85vh] w-[90%] max-w-[500px] rounded-lg bg-black border border-gray-800 p-6 shadow-xl focus:outline-none z-50 overflow-y-scroll hide-scrollbar ">
						<Dialog.Title className="text-xl font-semibold text-white mb-4">
							Add to Treasury
						</Dialog.Title>

						<Dialog.Close className="absolute top-4 right-4 text-gray-400 hover:text-white">
							<X size={20} />
						</Dialog.Close>

						<Tabs.Root value={currentTab} onValueChange={setCurrentTab}>
							<Tabs.List className="flex border-b border-gray-800 mb-6">
								<Tabs.Trigger
									value="transaction-details"
									className={`px-4 py-2 text-sm font-medium ${currentTab === 'transaction-details' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-primary'}`}
								>
									Transaction Details
								</Tabs.Trigger>
								<Tabs.Trigger
									value="advanced-options"
									className={`px-4 py-2 text-sm font-medium ${currentTab === 'advanced-options' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-300'}`}
								>
									Advanced Options
								</Tabs.Trigger>
							</Tabs.List>

							<form onSubmit={handleSubmit}>
								<Tabs.Content value="transaction-details" className="space-y-4">
									<div className="space-y-2">
										<label htmlFor="amount" className="block text-sm font-medium text-gray-300">
											Amount <span className="text-red-500">*</span>
										</label>
										<div className="flex">
											<input
												type="number"
												id="amount"
												name="amount"
												value={formData.amount}
												onChange={handleInputChange}
												className={`flex-1 bg-gray-900 border ${errors.amount ? 'border-red-500' : 'border-gray-700'} rounded-l-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary`}
												placeholder="0.00"
											/>
											<select
												id="asset"
												name="asset"
												value={formData.asset}
												onChange={handleInputChange}
												className={`bg-gray-900 border ${errors.asset ? 'border-red-500' : 'border-gray-700'} border-l-0 rounded-r-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary`}
											>
												<option value="XLM">XLM</option>
												<option value="USDC">USDC</option>
												<option value="BTC">BTC</option>
												<option value="ETH">ETH</option>
											</select>
										</div>
										{errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
									</div>

									<div className="space-y-2">
										<label
											htmlFor="transactionType"
											className="block text-sm font-medium text-gray-300"
										>
											Transaction Type
										</label>
										<select
											id="transactionType"
											name="transactionType"
											value={formData.transactionType}
											onChange={handleInputChange}
											className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
										>
											<option value="Deposit">Deposit</option>
											<option value="Transfer">Transfer</option>
											<option value="Withdrawal">Withdrawal</option>
											<option value="Investment">Investment</option>
										</select>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="sourceAddress"
											className="block text-sm font-medium text-gray-300"
										>
											Source Address <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											id="sourceAddress"
											name="sourceAddress"
											value={formData.sourceAddress}
											onChange={handleInputChange}
											className={`w-full bg-gray-900 border ${errors.sourceAddress ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary`}
											placeholder="0x..."
										/>
										{errors.sourceAddress && (
											<p className="text-xs text-red-500">{errors.sourceAddress}</p>
										)}
									</div>

									<div className="space-y-2">
										<label
											htmlFor="destinationAddress"
											className="block text-sm font-medium text-gray-300"
										>
											Destination Address <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											id="destinationAddress"
											name="destinationAddress"
											value={formData.destinationAddress}
											onChange={handleInputChange}
											className={`w-full bg-gray-900 border ${errors.destinationAddress ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary`}
											placeholder="0x..."
										/>
										{errors.destinationAddress && (
											<p className="text-xs text-red-500">{errors.destinationAddress}</p>
										)}
									</div>

									<div className="space-y-2">
										<label htmlFor="memo" className="block text-sm font-medium text-gray-300">
											Memo / Description
										</label>
										<textarea
											id="memo"
											name="memo"
											value={formData.memo}
											onChange={handleInputChange}
											rows={3}
											className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
											placeholder="Add a description for this transaction..."
										/>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="referenceId"
											className="block text-sm font-medium text-gray-300"
										>
											Reference ID (Optional)
										</label>
										<input
											type="text"
											id="referenceId"
											name="referenceId"
											value={formData.referenceId}
											onChange={handleInputChange}
											className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
											placeholder="External reference ID..."
										/>
									</div>
								</Tabs.Content>

								<Tabs.Content value="advanced-options" className="space-y-6">
									<div className="flex items-center justify-between">
										<label htmlFor="requireMultiSig" className="text-sm font-medium text-gray-300">
											Require Multi-signature
										</label>
										<Switch.Root
											id="requireMultiSig"
											checked={formData.requireMultiSig}
											onCheckedChange={(checked) => handleSwitchChange('requireMultiSig', checked)}
											className="w-10 h-5 bg-gray-700 rounded-full relative data-[state=checked]:bg-primary focus:outline-none"
										>
											<Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-5" />
										</Switch.Root>
									</div>

									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<label
												htmlFor="scheduleTransaction"
												className="text-sm font-medium text-gray-300"
											>
												Schedule Transaction
											</label>
											<Switch.Root
												id="scheduleTransaction"
												checked={formData.scheduleTransaction}
												onCheckedChange={(checked) =>
													handleSwitchChange('scheduleTransaction', checked)
												}
												className="w-10 h-5 bg-gray-700 rounded-full relative data-[state=checked]:bg-primary focus:outline-none"
											>
												<Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-5" />
											</Switch.Root>
										</div>

										{formData.scheduleTransaction && (
											<div className="pl-4 border-l border-gray-700">
												<label
													htmlFor="scheduledDateTime"
													className="block text-sm font-medium text-gray-300 mb-2"
												>
													Date & Time
												</label>
												<div className="flex space-x-2">
													<div className="relative flex-1">
														<input
															type="datetime-local"
															id="scheduledDateTime"
															name="scheduledDateTime"
															value={formData.scheduledDateTime}
															onChange={handleInputChange}
															className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
														/>
														<Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
													</div>
												</div>
											</div>
										)}
									</div>

									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<label
												htmlFor="recurringTransaction"
												className="text-sm font-medium text-gray-300"
											>
												Recurring Transaction
											</label>
											<Switch.Root
												id="recurringTransaction"
												checked={formData.recurringTransaction}
												onCheckedChange={(checked) =>
													handleSwitchChange('recurringTransaction', checked)
												}
												className="w-10 h-5 bg-gray-700 rounded-full relative data-[state=checked]:bg-primary focus:outline-none"
											>
												<Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-5" />
											</Switch.Root>
										</div>

										{formData.recurringTransaction && (
											<div className="pl-4 border-l border-gray-700">
												<label
													htmlFor="recurringFrequency"
													className="block text-sm font-medium text-gray-300 mb-2"
												>
													Frequency
												</label>
												<select
													id="recurringFrequency"
													name="recurringFrequency"
													value={formData.recurringFrequency}
													onChange={handleInputChange}
													className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
												>
													<option value="Daily">Daily</option>
													<option value="Weekly">Weekly</option>
													<option value="Monthly">Monthly</option>
													<option value="Quarterly">Quarterly</option>
												</select>
											</div>
										)}
									</div>
								</Tabs.Content>

								<div className="mt-6 flex justify-end space-x-3">
									<button
										type="button"
										onClick={() => setIsOpen(false)}
										className="px-4 py-2 rounded-md bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-500"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 rounded-md bg-primary text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-primary"
									>
										Submit Transaction
									</button>
								</div>
							</form>
						</Tabs.Root>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</ErrorBoundary>
	)
}

export default AddToTreasuryModal
