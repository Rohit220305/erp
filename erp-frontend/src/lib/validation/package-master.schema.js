import { z } from "zod";

export const packageMasterAddUpdateSchema = z.object({
  packageName: z.string().min(1, "⚠Please enter Package Type Name."),
  packageCode: z.string().min(1, "⚠Please enter Package Type Code."),
  abbreviation: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z
    .enum(["Active", "Inactive"], "⚠Please select Status.")
    .default("Active"),
});
