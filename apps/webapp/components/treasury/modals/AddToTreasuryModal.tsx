"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Calendar, Plus, AlertCircle } from "lucide-react"

// Form data interface
interface FormData {
  amount: string
  asset: string
  transactionType: string
  sourceAddress: string
  destinationAddress: string
  memo: string
  referenceId: string
  requireMultiSig: boolean
  scheduleTransaction: boolean
  scheduledDateTime: string
  recurringTransaction: boolean
  recurringFrequency: string
}

// Type definitions
type Errors = Partial<Record<keyof FormData, string>>
type Touched = Partial<Record<keyof FormData, boolean>>

// Move this function outside the component
const validateField = (name: keyof FormData, value: string | boolean, formData: FormData): string => {
  switch (name) {
    case "amount":
      if (!value) return "Amount is required"
      if (typeof value === "string" && (isNaN(Number.parseFloat(value)) || Number.parseFloat(value) <= 0))
        return "Amount must be a positive number"
      if (typeof value === "string" && Number.parseFloat(value) > 1000000) return "Amount cannot exceed 1,000,000"
      return ""
    case "asset":
      if (!value) return "Asset is required"
      return ""
    case "sourceAddress":
      if (!value) return "Source address is required"
      if (typeof value === "string" && value.length < 10) return "Source address must be at least 10 characters"
      if (typeof value === "string" && !/^[a-zA-Z0-9]+$/.test(value))
        return "Source address contains invalid characters"
      return ""
    case "destinationAddress":
      if (!value) return "Destination address is required"
      if (typeof value === "string" && value.length < 10) return "Destination address must be at least 10 characters"
      if (typeof value === "string" && !/^[a-zA-Z0-9]+$/.test(value))
        return "Destination address contains invalid characters"
      if (value === formData.sourceAddress) return "Destination address cannot be the same as source address"
      return ""
    case "scheduledDateTime":
      if (formData.scheduleTransaction && !value) return "Date and time are required for scheduled transactions"
      if (formData.scheduleTransaction && typeof value === "string" && new Date(value) <= new Date())
        return "Scheduled date must be in the future"
      return ""
    case "memo":
      if (typeof value === "string" && value.length > 500) return "Memo cannot exceed 500 characters"
      return ""
    case "referenceId":
      if (typeof value === "string" && value.length > 100) return "Reference ID cannot exceed 100 characters"
      return ""
    default:
      return ""
  }
}

export default function AddToTreasuryModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState("transaction-details")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<FormData>({
    amount: "",
    asset: "XLM",
    transactionType: "Deposit",
    sourceAddress: "",
    destinationAddress: "",
    memo: "",
    referenceId: "",
    requireMultiSig: false,
    scheduleTransaction: false,
    scheduledDateTime: "",
    recurringTransaction: false,
    recurringFrequency: "Weekly",
  })

  // Validation state
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Touched>({})

  // Real-time validation
  useEffect(() => {
    const newErrors: Errors = {}
    Object.keys(formData).forEach((key) => {
      const fieldKey = key as keyof FormData
      if (touched[fieldKey]) {
        const error = validateField(fieldKey, formData[fieldKey], formData)
        if (error) newErrors[fieldKey] = error
      }
    })
    setErrors(newErrors)
  }, [formData, touched])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Mark field as touched
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name as keyof FormData]: true }))
  }

  const handleSwitchChange = (name: keyof FormData, checked: boolean): void => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
    // Clear related fields when switches are turned off
    if (!checked) {
      if (name === "scheduleTransaction") {
        setFormData((prev) => ({ ...prev, scheduledDateTime: "" }))
        setTouched((prev) => ({ ...prev, scheduledDateTime: false }))
      }
      if (name === "recurringTransaction") {
        setFormData((prev) => ({ ...prev, recurringFrequency: "Weekly" }))
      }
    }
  }

  const validateAllFields = () => {
    const newErrors: Errors = {}
    const fieldsToValidate: (keyof FormData)[] = [
      "amount",
      "asset",
      "sourceAddress",
      "destinationAddress",
      "memo",
      "referenceId",
    ]

    // Add conditional validation fields
    if (formData.scheduleTransaction) {
      fieldsToValidate.push("scheduledDateTime")
    }

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field], formData)
      if (error) newErrors[field] = error
    })

    setErrors(newErrors)

    // Mark all fields as touched
    const allTouched: Touched = {}
    fieldsToValidate.forEach((field) => {
      allTouched[field] = true
    })
    setTouched(allTouched)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!validateAllFields()) {
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise<void>((resolve) => setTimeout(resolve, 2000))
      console.log("Form submitted with data:", formData)

      // Reset form after successful submission
      setFormData({
        amount: "",
        asset: "XLM",
        transactionType: "Deposit",
        sourceAddress: "",
        destinationAddress: "",
        memo: "",
        referenceId: "",
        requireMultiSig: false,
        scheduleTransaction: false,
        scheduledDateTime: "",
        recurringTransaction: false,
        recurringFrequency: "Weekly",
      })
      setErrors({})
      setTouched({})
      setIsOpen(false)
    } catch (error) {
      console.error("Submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    Object.keys(errors).length === 0 &&
    formData.amount &&
    formData.asset &&
    formData.sourceAddress &&
    formData.destinationAddress

  const getFieldErrorId = (fieldName: keyof FormData): string => `${fieldName}-error`

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add to Treasury
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="max-h-[85vh] w-full max-w-[500px] rounded-lg bg-black border border-gray-800 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Add to Treasury</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              {/* Tabs */}
              <div className="flex border-b border-gray-800 mb-6">
                <button
                  onClick={() => setCurrentTab("transaction-details")}
                  className={`px-4 py-2 text-sm font-medium ${
                    currentTab === "transaction-details"
                      ? "text-indigo-400 border-b-2 border-indigo-400"
                      : "text-gray-400 hover:text-indigo-400"
                  }`}
                >
                  Transaction Details
                </button>
                <button
                  onClick={() => setCurrentTab("advanced-options")}
                  className={`px-4 py-2 text-sm font-medium ${
                    currentTab === "advanced-options"
                      ? "text-indigo-400 border-b-2 border-indigo-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Advanced Options
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Transaction Details Tab */}
                {currentTab === "transaction-details" && (
                  <div className="space-y-4">
                    {/* Amount and Asset */}
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
                          onBlur={handleBlur}
                          className={`flex-1 bg-gray-900 border ${
                            errors.amount ? "border-red-500" : "border-gray-700"
                          } rounded-l-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          aria-invalid={!!errors.amount}
                          aria-describedby={errors.amount ? getFieldErrorId("amount") : undefined}
                        />
                        <select
                          id="asset"
                          name="asset"
                          value={formData.asset}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`bg-gray-900 border ${
                            errors.asset ? "border-red-500" : "border-gray-700"
                          } border-l-0 rounded-r-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                          aria-invalid={!!errors.asset}
                          aria-describedby={errors.asset ? getFieldErrorId("asset") : undefined}
                        >
                          <option value="XLM">XLM</option>
                          <option value="USDC">USDC</option>
                          <option value="BTC">BTC</option>
                          <option value="ETH">ETH</option>
                        </select>
                      </div>
                      {errors.amount && (
                        <p id={getFieldErrorId("amount")} className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.amount}
                        </p>
                      )}
                    </div>

                    {/* Transaction Type */}
                    <div className="space-y-2">
                      <label htmlFor="transactionType" className="block text-sm font-medium text-gray-300">
                        Transaction Type
                      </label>
                      <select
                        id="transactionType"
                        name="transactionType"
                        value={formData.transactionType}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Deposit">Deposit</option>
                        <option value="Transfer">Transfer</option>
                        <option value="Withdrawal">Withdrawal</option>
                        <option value="Investment">Investment</option>
                      </select>
                    </div>

                    {/* Source Address */}
                    <div className="space-y-2">
                      <label htmlFor="sourceAddress" className="block text-sm font-medium text-gray-300">
                        Source Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="sourceAddress"
                        name="sourceAddress"
                        value={formData.sourceAddress}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full bg-gray-900 border ${
                          errors.sourceAddress ? "border-red-500" : "border-gray-700"
                        } rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                        placeholder="0x..."
                        aria-invalid={!!errors.sourceAddress}
                        aria-describedby={errors.sourceAddress ? getFieldErrorId("sourceAddress") : undefined}
                      />
                      {errors.sourceAddress && (
                        <p
                          id={getFieldErrorId("sourceAddress")}
                          className="text-xs text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {errors.sourceAddress}
                        </p>
                      )}
                    </div>

                    {/* Destination Address */}
                    <div className="space-y-2">
                      <label htmlFor="destinationAddress" className="block text-sm font-medium text-gray-300">
                        Destination Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="destinationAddress"
                        name="destinationAddress"
                        value={formData.destinationAddress}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full bg-gray-900 border ${
                          errors.destinationAddress ? "border-red-500" : "border-gray-700"
                        } rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                        placeholder="0x..."
                        aria-invalid={!!errors.destinationAddress}
                        aria-describedby={errors.destinationAddress ? getFieldErrorId("destinationAddress") : undefined}
                      />
                      {errors.destinationAddress && (
                        <p
                          id={getFieldErrorId("destinationAddress")}
                          className="text-xs text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {errors.destinationAddress}
                        </p>
                      )}
                    </div>

                    {/* Memo */}
                    <div className="space-y-2">
                      <label htmlFor="memo" className="block text-sm font-medium text-gray-300">
                        Memo / Description
                      </label>
                      <textarea
                        id="memo"
                        name="memo"
                        value={formData.memo}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        rows={3}
                        className={`w-full bg-gray-900 border ${
                          errors.memo ? "border-red-500" : "border-gray-700"
                        } rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                        placeholder="Add a description for this transaction..."
                        maxLength={500}
                        aria-invalid={!!errors.memo}
                        aria-describedby={errors.memo ? getFieldErrorId("memo") : undefined}
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{formData.memo.length}/500 characters</span>
                        {errors.memo && (
                          <span id={getFieldErrorId("memo")} className="text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.memo}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reference ID */}
                    <div className="space-y-2">
                      <label htmlFor="referenceId" className="block text-sm font-medium text-gray-300">
                        Reference ID (Optional)
                      </label>
                      <input
                        type="text"
                        id="referenceId"
                        name="referenceId"
                        value={formData.referenceId}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full bg-gray-900 border ${
                          errors.referenceId ? "border-red-500" : "border-gray-700"
                        } rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                        placeholder="External reference ID..."
                        maxLength={100}
                        aria-invalid={!!errors.referenceId}
                        aria-describedby={errors.referenceId ? getFieldErrorId("referenceId") : undefined}
                      />
                      {errors.referenceId && (
                        <p id={getFieldErrorId("referenceId")} className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.referenceId}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Advanced Options Tab */}
                {currentTab === "advanced-options" && (
                  <div className="space-y-6">
                    {/* Multi-signature */}
                    <div className="flex items-center justify-between">
                      <label htmlFor="requireMultiSig" className="text-sm font-medium text-gray-300">
                        Require Multi-signature
                      </label>
                      <button
                        type="button"
                        id="requireMultiSig"
                        onClick={() => handleSwitchChange("requireMultiSig", !formData.requireMultiSig)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${
                          formData.requireMultiSig ? "bg-indigo-600" : "bg-gray-700"
                        }`}
                        aria-checked={formData.requireMultiSig}
                        role="switch"
                      >
                        <span
                          className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                            formData.requireMultiSig ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Schedule Transaction */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label htmlFor="scheduleTransaction" className="text-sm font-medium text-gray-300">
                          Schedule Transaction
                        </label>
                        <button
                          type="button"
                          id="scheduleTransaction"
                          onClick={() => handleSwitchChange("scheduleTransaction", !formData.scheduleTransaction)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${
                            formData.scheduleTransaction ? "bg-indigo-600" : "bg-gray-700"
                          }`}
                          aria-checked={formData.scheduleTransaction}
                          role="switch"
                        >
                          <span
                            className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                              formData.scheduleTransaction ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      {formData.scheduleTransaction && (
                        <div className="pl-4 border-l border-gray-700 space-y-2">
                          <label htmlFor="scheduledDateTime" className="block text-sm font-medium text-gray-300">
                            Date & Time
                          </label>
                          <div className="relative">
                            <input
                              type="datetime-local"
                              id="scheduledDateTime"
                              name="scheduledDateTime"
                              value={formData.scheduledDateTime}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              className={`w-full bg-gray-900 border ${
                                errors.scheduledDateTime ? "border-red-500" : "border-gray-700"
                              } rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                              aria-invalid={!!errors.scheduledDateTime}
                              aria-describedby={
                                errors.scheduledDateTime ? getFieldErrorId("scheduledDateTime") : undefined
                              }
                            />
                            <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
                          </div>
                          {errors.scheduledDateTime && (
                            <p
                              id={getFieldErrorId("scheduledDateTime")}
                              className="text-xs text-red-500 flex items-center gap-1"
                            >
                              <AlertCircle className="h-3 w-3" />
                              {errors.scheduledDateTime}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Recurring Transaction */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label htmlFor="recurringTransaction" className="text-sm font-medium text-gray-300">
                          Recurring Transaction
                        </label>
                        <button
                          type="button"
                          id="recurringTransaction"
                          onClick={() => handleSwitchChange("recurringTransaction", !formData.recurringTransaction)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${
                            formData.recurringTransaction ? "bg-indigo-600" : "bg-gray-700"
                          }`}
                          aria-checked={formData.recurringTransaction}
                          role="switch"
                        >
                          <span
                            className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                              formData.recurringTransaction ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      {formData.recurringTransaction && (
                        <div className="pl-4 border-l border-gray-700 space-y-2">
                          <label htmlFor="recurringFrequency" className="block text-sm font-medium text-gray-300">
                            Frequency
                          </label>
                          <select
                            id="recurringFrequency"
                            name="recurringFrequency"
                            value={formData.recurringFrequency}
                            onChange={handleInputChange}
                            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-md bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      isFormValid && !isSubmitting
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Transaction"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
