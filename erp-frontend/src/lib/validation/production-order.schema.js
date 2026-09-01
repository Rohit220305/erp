import { z } from "zod";

export const productionOrderSchema = z.object({
  companyId: z.coerce.number().optional().nullable(),
  itemId: z.coerce.number().min(1, "Please select a Production Item"),
  bomId: z.coerce.number().min(1, "Please select a Bill of Material"),
  productionQuantity: z.coerce
    .number({ invalid_type_error: "Production Quantity must be a number" })
    .min(0.0001, "Production Quantity must be greater than 0"),
  productionDate: z
    .string()
    .min(1, "Production Date is required")
    .refine(
      (val) => {
        if (!val) return false;
        const inputDate = new Date(val);
        return !isNaN(inputDate.getTime());
      },
      { message: "Please enter a valid Production Date" }
    ),
  referenceNumber: z.string().optional().nullable(),
  remark: z.string().optional().nullable(),
  status: z
    .enum(["Draft", "Pending", "Cancelled", "PartialCancelled", "Completed"])
    .optional()
    .default("Draft"),
});
