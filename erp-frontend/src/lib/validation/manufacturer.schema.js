import { z } from "zod";

export const getManufacturerSchema = (isSuperAdmin = false) => {
  return z
    .object({
      companyId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      manufacturerName: z.string().min(1, "Please enter Manufacturer Name."),
      manufacturerCode: z.string().min(1, "Please enter Manufacturer Code."),
      referenceCode: z.string().optional().nullable(),
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
