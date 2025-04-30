import { z } from "zod";

export const swapAssetsSchema = z
  .object({
    fromAsset: z.string({
      required_error: "Please select a source asset",
    }),
    toAsset: z.string({
      required_error: "Please select a destination asset",
    }),
    amount: z.coerce
      .number({
        required_error: "Amount is required",
        invalid_type_error: "Amount must be a number",
      })
      .positive("Amount must be positive"),
  })
  .refine((data) => data.fromAsset !== data.toAsset, {
    message: "Source and destination assets must be different",
    path: ["toAsset"],
  });

export type SwapAssetsFormValues = z.infer<typeof swapAssetsSchema>;
