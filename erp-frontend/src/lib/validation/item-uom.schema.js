import { z } from "zod";

export const getItemUomSchema = (isSuperAdmin = false) => {
  return z
    .object({
      companyId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      uomName: z.string().min(1, " Please enter UOM Name"),
      isoCode: z.string().optional().nullable(),
      abbreviation: z.string().optional().nullable(),
      itemUomCode: z.string().min(1, " Please enter UOM Code"),
      unitType: z.string().min(1, " Please select Unit Type"),
      status: z
        .enum(["Active", "Inactive"], "Please select Status.")
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
        message: "Please select Company.",
        path: ["companyId"],
      },
    );
};
