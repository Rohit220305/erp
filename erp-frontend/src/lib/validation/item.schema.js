import { z } from "zod";

const requiredNumber = (message) => z.any()
  .refine((val) => val !== "" && val !== null && val !== undefined, message)
  .transform((val) => Number(val))
  .refine((val) => !isNaN(val) && val >= 0, message);

export const getItemSchema = (isSuperAdmin = false) => {
  return z
    .object({
      id: z.any().optional().nullable(),

      itemName: z.string().trim().min(1, "Please enter Item Name."),
      itemCode: z.string().trim().min(1, "Please enter Item Code."),
      shortName: z.string().trim().optional().nullable(),
      printName: z.string().trim().optional().nullable(),
      referenceCode: z.string().trim().optional().nullable(),
      barcode: z.string().trim().min(1, "Please enter Barcode."),
      vendorBarcode: z.string().trim().optional().nullable(),
      usageType: z.string().min(1, "Please select Usage Type."),

      companyId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      categoryId: z.coerce.number().min(1, "Please select Category."),
      manufacturerId: z.coerce.number().min(1, "Please select Manufacturer."),
      brandId: z.coerce.number().min(1, "Please select Brand."),
      storageId: z.coerce.number().min(1, "Please select Storage."),

      inventoryType: z.string().min(1, "Please select Inventory Type."),
      isDecimalAllowed: z.string().min(1, "Please select Decimal Allowed."),
      itemUomId: z.coerce.number().min(1, "Please select Item UOM."),
      packageUomId: z.coerce.number().min(1, "Please select Package UOM."),
      unitsPerPacking: z.coerce
        .number()
        .min(1, "Please enter Units Per Packing."),
      primitiveQuantity: requiredNumber("Please enter Primitive Quantity."),

      currencyCode: z.string().min(1, "Please select Currency."),
      purchasePrice: requiredNumber("Please enter Purchase Price."),
      costPrice: requiredNumber("Please enter Cost Price."),
      costPerUnit: requiredNumber("Please enter Cost Per Unit."),

      weight: z.coerce.number().optional().nullable(),
      weightUomId: z.coerce.number().optional().nullable(),
      volume: z.coerce.number().optional().nullable(),
      volumeUomId: z.coerce.number().optional().nullable(),
      length: z.coerce.number().optional().nullable(),
      width: z.coerce.number().optional().nullable(),
      height: z.coerce.number().optional().nullable(),
      dimensionUomId: z.coerce.number().optional().nullable(),

      shelfLife: requiredNumber("Please enter Shelf Life."),
      shelfLifeUnit: z.string().min(1, "Please select Shelf Life Unit."),
      batchCode: z.string().trim().min(1, "Please enter Batch Code."),
      isScrap: z.string().min(1, "Please select Is Scrap."),
      description: z.string().trim().optional().nullable(),
      remark: z.string().trim().optional().nullable(),

      status: z
        .enum(["Active", "Inactive"], {
          errorMap: () => ({ message: "Please select Status." }),
        })
        .default("Active"),

      primaryImageIndex: z.any().optional().nullable(),
      existingImages: z.any().optional().nullable(),
      itemImages: z.any().optional().nullable(),
    })
    .refine(
      (data) => {
        if (isSuperAdmin && !data.companyId) {
          return false;
        }
        return true;
      },
      {
        message: "Please select Company.",
        path: ["companyId"],
      },
    );
};
