import { z } from "zod";

export const getItemCategorySchema = (isSuperAdmin = false) => {
  return z
    .object({
      companyId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      categoryName: z
        .string()
        .trim()
        .min(1, "⚠Please enter Category Name."),
      categoryCode: z
        .string()
        .trim()
        .min(1, "⚠Please enter Category Code."),
      referenceCode: z
        .string()
        .trim()
        .optional()
        .nullable(),
      parentId: z.any().optional().nullable(),
      storageIds: z.array(z.any()).optional().nullable(),
      status: z
        .enum(["Active", "Inactive"], {
          errorMap: () => ({ message: "⚠Please select Status." }),
        })
        .default("Active"),
    })
    .refine(
      (data) => {
        if (isSuperAdmin && !data.companyId) {
          return false;
        }
        return true;
      },
      {
        message: "⚠Please select Company.",
        path: ["companyId"],
      }
    );
};
