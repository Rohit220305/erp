import { z } from "zod";

export const getProductionBatchSchema = (primitiveQuantity = 0) => {
  const minQty = Number(primitiveQuantity) > 0 ? Number(primitiveQuantity) : 0.0001;

  return z.object({
    companyId: z.coerce.number().optional().nullable(),
    productionOrderId: z.coerce.number().min(1, "Please select Production Order"),
    bomId: z.coerce.number().min(1, "Please select BOM"),
    itemId: z.coerce.number().optional().nullable(),
    batchQuantity: z.coerce
      .number({ invalid_type_error: "Please enter a valid batch quantity" })
      .min(
        minQty,
        Number(primitiveQuantity) > 0
          ? `Batch Quantity must be greater than or equal to Base Qty (${primitiveQuantity})`
          : "Batch Quantity must be greater than 0"
      ),
    processes: z
      .array(
        z.object({
          processTemplateMappingId: z.coerce.number().min(1),
          processId: z.coerce.number().min(1),
          sequenceNumber: z.coerce.number().min(1),
          items: z
            .array(
              z.object({
                itemId: z.coerce.number().min(1),
                materialType: z.enum(["Raw", "SemiFinished", "Finished"]),
                requiredQty: z.coerce.number(),
                shortage: z.coerce.number(),
                requestQty: z.coerce.number(),
              })
            )
            .optional(),
        })
      )
      .optional(),
  });
};

export const productionBatchSchema = getProductionBatchSchema(0);
