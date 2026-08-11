import { z } from "zod";

export const itemUomSchema = z.object({
  uomName: z.string().min(1, "⚠ Please enter UOM Name"),
  isoCode: z.string().optional().nullable(),
  abbreviation: z.string().optional().nullable(),
  itemUomCode: z.string().min(1, "⚠ Please enter UOM Code"),
  unitType: z.string().min(1, "⚠ Please select Unit Type"),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});
