import { z } from "zod";

export const materialRequestItemSchema = z.object({
  itemId: z.coerce
    .number({
      required_error: "Please select Item.",
      invalid_type_error: "Please select Item.",
    })
    .min(1, "Please select Item."),
  requestedQty: z.coerce
    .number({
      required_error: "Quantity is required.",
      invalid_type_error: "Quantity must be a valid number.",
    })
    .gt(0, "Quantity must be greater than 0."),
});

export const materialRequestSchema = z
  .object({
    plantId: z.coerce.number({
      required_error: "Please select Plant.",
      invalid_type_error: "Please select Plant.",
    }).min(1, "Please select Plant."),
    warehouseId: z.coerce.number({
      required_error: "Please select Warehouse.",
      invalid_type_error: "Please select Warehouse.",
    }).min(1, "Please select Warehouse."),
    remark: z.string().optional().nullable(),
    items: z
      .array(materialRequestItemSchema)
      .min(1, "At least one material item is required."),
  })
  .superRefine((data, ctx) => {
    if (data.items && data.items.length > 0) {
      const seenItemIds = new Set();
      data.items.forEach((item, index) => {
        if (item.itemId) {
          const numId = Number(item.itemId);
          if (seenItemIds.has(numId)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Duplicate items are not allowed in the request.",
              path: ["items", index, "itemId"],
            });
          } else {
            seenItemIds.add(numId);
          }
        }
      });
    }
  });
