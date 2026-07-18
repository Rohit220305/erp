import { z } from "zod";

export const currencyAddSchema = z.object({
  currencyCode: z.string().min(1, "Currency code is required").max(10, "Max 10 characters"),
  currencyName: z.string().min(1, "Currency name is required").max(100, "Max 100 characters"),
  currencySymbol: z.string().min(1, "Currency symbol is required").max(10, "Max 10 characters"),
  status: z.enum(["Active", "InActive"]).default("Active"),
});

export const currencyEditSchema = z.object({
  currencyName: z.string().min(1, "Currency name is required").max(100, "Max 100 characters"),
  currencySymbol: z.string().min(1, "Currency symbol is required").max(10, "Max 10 characters"),
  status: z.enum(["Active", "InActive"]).default("Active"),
});
