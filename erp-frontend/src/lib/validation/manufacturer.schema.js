import { z } from "zod";

export const manufacturerAddUpdateSchema = z.object({
  manufacturerName: z.string().min(1, "⚠Please enter Manufacturer Name."),
  manufacturerCode: z.string().min(1, "⚠Please enter Manufacturer Code."),
  referenceCode: z.string().optional().nullable(),
  status: z
    .enum(["Active", "Inactive"], "⚠Please select Status.")
    .default("Active"),
});
