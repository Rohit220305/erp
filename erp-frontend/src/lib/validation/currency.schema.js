import { z } from "zod";

export const currencyAddSchema = z.object({
  currencyCode: z.string().min(1, "Please enter Currency Code."),
  currencyName: z.string().min(1, "Please enter Currency Name."),
  currencySymbol: z.string().min(1, "Please enter Currency Symbol."),
  status: z
    .enum(["Active", "Inactive"], "Please select Status.")
    .default("Active"),
});

export const currencyEditSchema = z.object({
  currencyName: z.string().min(1, "Please enter Currency Name."),
  currencySymbol: z.string().min(1, "Please enter Currency Symbol."),
  status: z
    .enum(["Active", "Inactive"], "Please select Status.")
    .default("Active"),
});
