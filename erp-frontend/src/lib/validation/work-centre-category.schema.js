import { z } from "zod";

export const workCentreCategoryAddSchema = z.object({
  categoryName: z.string().min(1, "⚠Please enter Category Name."),
  categoryCode: z.string().min(1, "⚠Please enter Category Code."),
  status: z
    .enum(["Active", "Inactive"], "⚠Please select Status.")
    .default("Active"),
});

export const workCentreCategoryEditSchema = z.object({
  categoryName: z.string().min(1, "⚠Please enter Category Name."),
  categoryCode: z.string().min(1, "⚠Please enter Category Code."),
  status: z
    .enum(["Active", "Inactive"], "⚠Please select Status.")
    .default("Active"),
});
