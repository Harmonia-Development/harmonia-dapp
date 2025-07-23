"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { logDev } from "@/lib/utils/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Copy,
  Link,
  Mail,
  MessageCircle,
  Timer,
  User,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

// Generate a random referral code
function generateReferralCode(length = 11) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 2) {
      result += "-";
    }
  }
  return result;
}

const defaultValues: Partial<InviteFormValues> = {
  email: "",
  role: "member",
  message:
    "I'd like to invite you to join Harmonia DAO. Use my referral code to sign up.",
  referralCode: generateReferralCode(),
  expiration: "7",
  trackReferral: true,
  sendEmail: true,
  limitedTimeOffer: true,
};

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberModal({
  open,
  onOpenChange,
}: InviteMemberModalProps) {
  const [activeTab, setActiveTab] = useState("create");
  const [copied, setCopied] = useState(false);
  // const [_isSubmitting, _setIsSubmitting] = useState(false);
  // const _modalRef = useRef<HTMLDivElement>(null);
  // const _firstFocusableRef = useRef<HTMLInputElement>(null);
  // const _lastFocusableRef = useRef<HTMLButtonElement>(null);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues,
  });

  function onSubmit(data: InviteFormValues) {
    logDev("Invitation data:", data);

    toast.success(`Invitation sent to ${data.email}`)

    // Reset form and close modal
    form.reset(defaultValues);
    onOpenChange(false);
  }

  function regenerateCode() {
    const newCode = generateReferralCode();
    form.setValue("referralCode", newCode);
  }

  function copyInviteLink(onlyCode = false) {
    if (onlyCode) {
      navigator.clipboard.writeText(form.getValues("referralCode"));
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      return;
    }
    // In a real app, this would be a real invite link
    const inviteLink = `http://localhost:3000/invite/${form.getValues("referralCode")}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <ErrorBoundary>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-[600px] h-[90vh] p-0 flex flex-col"
          onPointerDownOutside={(e) => {
            // Prevent closing the dialog when clicking outside
            e.preventDefault();
          }}
        >
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Invite Member
              </DialogTitle>
              <DialogDescription>
                Invite new members to join your DAO as contributors.
              </DialogDescription>
            </DialogHeader>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1 w-full overflow-hidden"
          >
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create" className="font-semibold">
                  Create Invite
                </TabsTrigger>
                <TabsTrigger value="share" className="font-semibold">
                  Share Invite
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent
                value="create"
                className="flex-1 h-full data-[state=active]:flex flex-col overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <Form {...form}>
                    <form
                      id="invite-form"
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <div className="flex items-center gap-1 font-semibold">
                                <Mail className="h-4 w-4 text-gray-500" />
                                Email Address
                              </div>
                            </FormLabel>
                            <div className="ml-3">
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="member@example.com"
                                  className="focus-visible:ring-2 focus-visible:ring-primary"
                                />
                              </FormControl>
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
                                <User className="h-4 w-4 text-gray-500" />
                                Role
                              </div>
                            </FormLabel>
                            <div className="ml-3">
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="focus:ring-2 focus:ring-primary focus:ring-offset-0 border-input">
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem
                                    value="member"
                                    className="focus:bg-primary/10 data-[highlighted]:bg-primary cursor-pointer"
                                  >
                                    Member
                                  </SelectItem>
                                  <SelectItem
                                    value="contributor"
                                    className="focus:bg-primary/10 data-[highlighted]:bg-primary cursor-pointer"
                                  >
                                    Contributor
                                  </SelectItem>
                                  <SelectItem
                                    value="advisor"
                                    className="focus:bg-primary/10 data-[highlighted]:bg-primary cursor-pointer"
                                  >
                                    Advisor
                                  </SelectItem>
                                  <SelectItem
                                    value="admin"
                                    className="focus:bg-primary/10 data-[highlighted]:bg-primary cursor-pointer"
                                  >
                                    Admin
                                  </SelectItem>
                                </SelectContent>
                              </Select>
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
                                <MessageCircle className="h-4 w-4 text-gray-500" />
                                Invitation Message
                              </div>
                            </FormLabel>
                            <div className="ml-3">
                              <FormControl>
                                <Textarea
                                  placeholder="Write a personal message..."
                                  className="min-h-[100px] focus-visible:ring-2 focus-visible:ring-primary"
                                  {...field}
                                />
                              </FormControl>
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
                                  <Link className="h-4 w-4 text-gray-500" />
                                  Referral Code
                                </div>

                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={regenerateCode}
                                  className="font-semibold hover:bg-primary hover:text-white"
                                >
                                  Generate New
                                </Button>
                              </div>
                            </FormLabel>
                            <div className="ml-3 flex items-center space-x-2">
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled
                                  className="text-white disabled:text-white"
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => copyInviteLink(true)}
                                className="font-semibold hover:bg-primary hover:text-white"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormDescription>
                              This code will be used to track the referrals from
                              this invitation.
                            </FormDescription>
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
                                <Timer className="h-4 w-4 text-gray-500" />
                                Expiration
                              </div>
                            </FormLabel>
                            <div className="ml-3">
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="focus:ring-2 focus:ring-primary focus:ring-offset-0 border-input">
                                    <SelectValue placeholder="Select expiration" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem
                                    value="7"
                                    className="focus:bg-primary/10 data-[highlighted]:bg-primary cursor-pointer"
                                  >
                                    7 days
                                  </SelectItem>
                                  <SelectItem
                                    value="14"
                                    className="focus:bg-primary/10 data-[highlighted]:bg-primary cursor-pointer"
                                  >
                                    14 days
                                  </SelectItem>
                                  <SelectItem
                                    value="30"
                                    className="focus:bg-primary/10 data-[highlighted]:bg-primary cursor-pointer"
                                  >
                                    30 days
                                  </SelectItem>
                                  <SelectItem
                                    value="never"
                                    className="focus:bg-primary/10 data-[highlighted]:bg-primary cursor-pointer"
                                  >
                                    Never expires
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4 border rounded-lg p-4">
                        <h3 className="text-sm font-semibold">Options</h3>

                        <FormField
                          control={form.control}
                          name="trackReferral"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Track Referral
                                </FormLabel>
                                <FormDescription>
                                  Track this invitation in your referral
                                  statistics.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-800"
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
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
                                <FormLabel className="text-base">
                                  Send Email
                                </FormLabel>
                                <FormDescription>
                                  Send invitation via email automatically.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-800"
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
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
                                <FormLabel className="text-base">
                                  Limited Time Offer
                                </FormLabel>
                                <FormDescription>
                                  Add special incentives for quick sign-ups.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-800"
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
                </div>

                <div className="border-t p-4 mt-auto">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="hover:bg-primary-hover"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      form="invite-form"
                      className="bg-primary text-white font-semibold rounded-md px-4 py-2 flex items-center hover:bg-primary-hover"
                    >
                      Create Invitation
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="share"
                className="flex-1 h-full data-[state=active]:flex flex-col overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Share Invitation Link
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Share this unique invitation link with your new member.
                    </p>

                    <div className="flex items-center space-x-2">
                      <Input
                        readOnly
                        value={`http://localhost:3000/invite/${form.getValues("referralCode")}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyInviteLink()}
                        className="font-semibold hover:bg-primary hover:text-white"
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
}
