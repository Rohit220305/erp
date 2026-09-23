import { z } from "zod";

export const productionOrderSchema = z.object({
  companyId: z.coerce.number().optional().nullable(),
  itemId: z.coerce
    .number({ invalid_type_error: "Please select Production Item." })
    .min(1, "Please select Production Item."),
  bomId: z.coerce
    .number({ invalid_type_error: "Please select Bill of Material." })
    .min(1, "Please select Bill of Material."),
  productionQuantity: z.coerce
    .number("Please enter Production Qty.")
    .min(0.0001, "Production Qty must be greater than 0."),
  packageQuantity: z.coerce
    .number( "Please enter Package Qty." )
    .min(0.0001, "Package Qty must be greater than 0."),
  productionDate: z
    .string()
    .min(1, "Please select Production Date.")
    .refine(
      (val) => {
        if (!val) return false;
        const inputDate = new Date(val);
        return !isNaN(inputDate.getTime());
      },
      { message: "Please enter a valid Production Date." },
    ),
  referenceNumber: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  remark: z.string().optional().nullable(),
  status: z
    .enum(["Pending", "Cancelled", "PartialCancelled", "Completed"])
    .optional()
    .default("Pending"),
});
