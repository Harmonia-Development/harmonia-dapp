import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  DepositFundsFormValues,
  depositFundsSchema,
} from "../schema/deposit-funds-modal.schema";
import { useForm } from "react-hook-form";

interface UseDepositFundsProps {
  onClose: () => void;
}

export const useDepositFunds = ({ onClose }: UseDepositFundsProps) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<DepositFundsFormValues>({
    resolver: zodResolver(depositFundsSchema),
    defaultValues: {
      asset: "xlm",
      amount: undefined,
      source: "",
      memo: "",
    },
  });

  const onSubmit = async (data: DepositFundsFormValues) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Form submitted:", data);

    // Reset form and close modal
    form.reset();
    setIsSubmitting(false);
    onClose();
  };

  return { form, onSubmit, isSubmitting };
};
