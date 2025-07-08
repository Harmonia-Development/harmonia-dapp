"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Copy, Link, Mail, MessageCircle, Timer, User, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

// Form schema for validation
const inviteFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.string({ required_error: "Please select a role" }),
  message: z.string().optional(),
  referralCode: z.string().min(6, { message: "Referral code is required" }),
  expiration: z.string({
    required_error: "Please select an expiration period",
  }),
  trackReferral: z.boolean({
    message: "Track referral is required",
  }),
  sendEmail: z.boolean({
    message: "Send email is required",
  }),
  limitedTimeOffer: z.boolean({
    required_error: "Limited time offer is required",
  }),
})

type InviteFormValues = z.infer<typeof inviteFormSchema>

// Generate a random referral code
function generateReferralCode(length = 11) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
    if (i === 2) {
      result += "-"
    }
  }
  return result
}

const defaultValues: Partial<InviteFormValues> = {
  email: "",
  role: "member",
  message: "I'd like to invite you to join Harmonia DAO. Use my referral code to sign up.",
  referralCode: generateReferralCode(),
  expiration: "7",
  trackReferral: true,
  sendEmail: true,
  limitedTimeOffer: true,
}

interface InviteMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMemberModal({ open, onOpenChange }: InviteMemberModalProps) {
  const [activeTab, setActiveTab] = useState("create")
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLInputElement>(null)
  const lastFocusableRef = useRef<HTMLButtonElement>(null)

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues,
    mode: "onChange", // Enable real-time validation
  })

  const {
    formState: { errors, isValid },
  } = form

  // Focus management for modal
  useEffect(() => {
    if (open) {
      // Focus the first focusable element when modal opens
      setTimeout(() => {
        firstFocusableRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Focus trap implementation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onOpenChange(false)
    }

    if (e.key === "Tab") {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }
  }

  async function onSubmit(data: InviteFormValues) {
    setIsSubmitting(true)
    try {
      console.log("Invitation data:", data)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Invitation created successfully",
        description: `Invitation sent to ${data.email}`,
        variant: "default",
      })

      // Reset form and close modal
      form.reset(defaultValues)
      onOpenChange(false)
    } catch {
      toast({
        title: "Error creating invitation",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function regenerateCode() {
    const newCode = generateReferralCode()
    form.setValue("referralCode", newCode)

    // Announce to screen readers
    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", "polite")
    announcement.setAttribute("aria-atomic", "true")
    announcement.className = "sr-only"
    announcement.textContent = `New referral code generated: ${newCode}`
    document.body.appendChild(announcement)
    setTimeout(() => document.body.removeChild(announcement), 1000)
  }

  function copyInviteLink(onlyCode = false) {
    const textToCopy = onlyCode
      ? form.getValues("referralCode")
      : `http://localhost:3000/invite/${form.getValues("referralCode")}`

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)

    // Announce to screen readers
    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", "polite")
    announcement.setAttribute("aria-atomic", "true")
    announcement.className = "sr-only"
    announcement.textContent = `${onlyCode ? "Referral code" : "Invitation link"} copied to clipboard`
    document.body.appendChild(announcement)
    setTimeout(() => document.body.removeChild(announcement), 1000)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={modalRef}
        className="sm:max-w-[600px] h-[90vh] p-0 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        onKeyDown={handleKeyDown}
        onPointerDownOutside={(e) => {
          // Prevent closing the dialog when clicking outside
          e.preventDefault()
        }}
      >
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle id="modal-title" className="text-xl font-semibold">
              Invite Member
            </DialogTitle>
            <DialogDescription id="modal-description">
              Invite new members to join your DAO as contributors.
            </DialogDescription>
          </DialogHeader>
          {/* Close button for better accessibility */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 w-full overflow-hidden">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-2" role="tablist">
              <TabsTrigger
                value="create"
                className="font-semibold"
                role="tab"
                aria-selected={activeTab === "create"}
                aria-controls="create-panel"
              >
                Create Invite
              </TabsTrigger>
              <TabsTrigger
                value="share"
                className="font-semibold"
                role="tab"
                aria-selected={activeTab === "share"}
                aria-controls="share-panel"
              >
                Share Invite
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent
              value="create"
              id="create-panel"
              role="tabpanel"
              aria-labelledby="create-tab"
              className="flex-1 h-full data-[state=active]:flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <Form {...form}>
                  <form id="invite-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-1 font-semibold">
                              <Mail className="h-4 w-4 text-gray-500" aria-hidden="true" />
                              Email Address
                            </div>
                          </FormLabel>
                          <div className="ml-3">
                            <FormControl>
                              <Input
                                {...field}
                                ref={firstFocusableRef}
                                placeholder="member@example.com"
                                type="email"
                                autoComplete="email"
                                className={`focus-visible:ring-2 focus-visible:ring-[#723DCA] ${
                                  errors.email ? "border-red-500" : ""
                                }`}
                                aria-invalid={errors.email ? "true" : "false"}
                                aria-describedby={errors.email ? "email-error" : undefined}
                              />
                            </FormControl>
                            {errors.email && (
                              <p id="email-error" className="text-sm text-red-500 mt-1" role="alert">
                                {errors.email.message}
                              </p>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-1 font-semibold">
                              <User className="h-4 w-4 text-gray-500" aria-hidden="true" />
                              Role
                            </div>
                          </FormLabel>
                          <div className="ml-3">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger
                                  className={`focus:ring-2 focus:ring-[#723DCA] focus:ring-offset-0 border-input ${
                                    errors.role ? "border-red-500" : ""
                                  }`}
                                  aria-invalid={errors.role ? "true" : "false"}
                                  aria-describedby={errors.role ? "role-error" : undefined}
                                >
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem
                                  value="member"
                                  className="focus:bg-[#723DCA]/10 data-[highlighted]:bg-[#723DCA] cursor-pointer"
                                >
                                  Member
                                </SelectItem>
                                <SelectItem
                                  value="contributor"
                                  className="focus:bg-[#723DCA]/10 data-[highlighted]:bg-[#723DCA] cursor-pointer"
                                >
                                  Contributor
                                </SelectItem>
                                <SelectItem
                                  value="advisor"
                                  className="focus:bg-[#723DCA]/10 data-[highlighted]:bg-[#723DCA] cursor-pointer"
                                >
                                  Advisor
                                </SelectItem>
                                <SelectItem
                                  value="admin"
                                  className="focus:bg-[#723DCA]/10 data-[highlighted]:bg-[#723DCA] cursor-pointer"
                                >
                                  Admin
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.role && (
                              <p id="role-error" className="text-sm text-red-500 mt-1" role="alert">
                                {errors.role.message}
                              </p>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-1 font-semibold">
                              <MessageCircle className="h-4 w-4 text-gray-500" aria-hidden="true" />
                              Invitation Message
                            </div>
                          </FormLabel>
                          <div className="ml-3">
                            <FormControl>
                              <Textarea
                                placeholder="Write a personal message..."
                                className={`min-h-[100px] focus-visible:ring-2 focus-visible:ring-[#723DCA] ${
                                  errors.message ? "border-red-500" : ""
                                }`}
                                aria-invalid={errors.message ? "true" : "false"}
                                aria-describedby={errors.message ? "message-error" : "message-description"}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription id="message-description">
                              This message will be included in the invitation email.
                            </FormDescription>
                            {errors.message && (
                              <p id="message-error" className="text-sm text-red-500 mt-1" role="alert">
                                {errors.message.message}
                              </p>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="referralCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center justify-between font-semibold">
                              <div className="flex items-center gap-1">
                                <Link className="h-4 w-4 text-gray-500" aria-hidden="true" />
                                Referral Code
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={regenerateCode}
                                className="font-semibold hover:bg-[#723DCA] hover:text-white bg-transparent"
                                aria-label="Generate new referral code"
                              >
                                Generate New
                              </Button>
                            </div>
                          </FormLabel>
                          <div className="ml-3 flex items-center space-x-2">
                            <FormControl>
                              <Input
                                {...field}
                                readOnly
                                className={`text-white disabled:text-white ${
                                  errors.referralCode ? "border-red-500" : ""
                                }`}
                                aria-invalid={errors.referralCode ? "true" : "false"}
                                aria-describedby="referral-code-description"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => copyInviteLink(true)}
                              className="font-semibold hover:bg-[#723DCA] hover:text-white"
                              aria-label="Copy referral code to clipboard"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormDescription id="referral-code-description">
                            This code will be used to track the referrals from this invitation.
                          </FormDescription>
                          {errors.referralCode && (
                            <p className="text-sm text-red-500 mt-1" role="alert">
                              {errors.referralCode.message}
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-1 font-semibold">
                              <Timer className="h-4 w-4 text-gray-500" aria-hidden="true" />
                              Expiration
                            </div>
                          </FormLabel>
                          <div className="ml-3">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger
                                  className={`focus:ring-2 focus:ring-[#723DCA] focus:ring-offset-0 border-input ${
                                    errors.expiration ? "border-red-500" : ""
                                  }`}
                                  aria-invalid={errors.expiration ? "true" : "false"}
                                  aria-describedby={errors.expiration ? "expiration-error" : undefined}
                                >
                                  <SelectValue placeholder="Select expiration" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem
                                  value="7"
                                  className="focus:bg-[#723DCA]/10 data-[highlighted]:bg-[#723DCA] cursor-pointer"
                                >
                                  7 days
                                </SelectItem>
                                <SelectItem
                                  value="14"
                                  className="focus:bg-[#723DCA]/10 data-[highlighted]:bg-[#723DCA] cursor-pointer"
                                >
                                  14 days
                                </SelectItem>
                                <SelectItem
                                  value="30"
                                  className="focus:bg-[#723DCA]/10 data-[highlighted]:bg-[#723DCA] cursor-pointer"
                                >
                                  30 days
                                </SelectItem>
                                <SelectItem
                                  value="never"
                                  className="focus:bg-[#723DCA]/10 data-[highlighted]:bg-[#723DCA] cursor-pointer"
                                >
                                  Never expires
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.expiration && (
                              <p id="expiration-error" className="text-sm text-red-500 mt-1" role="alert">
                                {errors.expiration.message}
                              </p>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <fieldset className="space-y-4 border rounded-lg p-4">
                      <legend className="text-sm font-semibold px-2">Options</legend>

                      <FormField
                        control={form.control}
                        name="trackReferral"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Track Referral</FormLabel>
                              <FormDescription>Track this invitation in your referral statistics.</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                className="data-[state=checked]:bg-[#723DCA] data-[state=unchecked]:bg-[#2A2A2D]"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                aria-label="Track referral statistics"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sendEmail"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Send Email</FormLabel>
                              <FormDescription>Send invitation via email automatically.</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                className="data-[state=checked]:bg-[#723DCA] data-[state=unchecked]:bg-[#2A2A2D]"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                aria-label="Send invitation email automatically"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="limitedTimeOffer"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Limited Time Offer</FormLabel>
                              <FormDescription>Add special incentives for quick sign-ups.</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                className="data-[state=checked]:bg-[#723DCA] data-[state=unchecked]:bg-[#2A2A2D]"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                aria-label="Include limited time offer incentives"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </fieldset>
                  </form>
                </Form>
              </div>

              <div className="border-t p-4 mt-auto">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="hover:bg-[#5b2f9e]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    form="invite-form"
                    disabled={!isValid || isSubmitting}
                    className="bg-[#723DCA] text-white font-semibold rounded-md px-4 py-2 flex items-center hover:bg-[#5b2f9e] disabled:opacity-50 disabled:cursor-not-allowed"
                    ref={lastFocusableRef}
                    aria-label={isSubmitting ? "Creating invitation..." : "Create invitation"}
                  >
                    {isSubmitting ? "Creating..." : "Create Invitation"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="share"
              id="share-panel"
              role="tabpanel"
              aria-labelledby="share-tab"
              className="flex-1 h-full data-[state=active]:flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Share Invitation Link</h3>
                  <p className="text-sm text-muted-foreground">
                    Share this unique invitation link with your new member.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Input
                      readOnly
                      value={`http://localhost:3000/invite/${form.getValues("referralCode")}`}
                      aria-label="Invitation link"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyInviteLink()}
                      className="font-semibold hover:bg-[#723DCA] hover:text-white"
                      aria-label={copied ? "Link copied to clipboard" : "Copy invitation link to clipboard"}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
