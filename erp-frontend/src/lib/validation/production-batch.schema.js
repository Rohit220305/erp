import { z } from "zod";

export const getProductionBatchSchema = (primitiveQuantity = 0, pendingQuantity = null) => {
  const minQty = Number(primitiveQuantity) > 0 ? Number(primitiveQuantity)  :0;

  let batchQtySchema = z.coerce
    .number({ invalid_type_error: "Please enter a valid batch quantity" })
    .min(
      minQty,
      Number(primitiveQuantity) > 0
        ? `Batch Quantity must be greater than or equal to Base Qty (${primitiveQuantity})`
        : "Batch Quantity must be greater than 0"
    );

  if (pendingQuantity !== null && pendingQuantity !== undefined) {
    batchQtySchema = batchQtySchema.max(
      Number(pendingQuantity),
      `Batch Quantity cannot exceed pending quantity (${pendingQuantity})`
    );
  }

  return z.object({
    companyId: z.coerce.number().optional().nullable(),
    productionOrderId: z.coerce.number().min(1, "Please select Production Order"),
    bomId: z.coerce.number().min(1, "Please select BOM"),
    itemId: z.coerce.number().optional().nullable(),
    batchQuantity: batchQtySchema,
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
                requestedQty: z.coerce.number().optional(),
              })
            )
            .optional(),
        })
      )
      .optional(),
  });
};

export const productionBatchSchema = getProductionBatchSchema(0);
