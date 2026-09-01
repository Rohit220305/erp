import { z } from "zod";

export const getBrandSchema = (isSuperAdmin = false) => {
  return z
    .object({
      companyId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      manufacturerId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      brandName: z.string().min(1, " Please enter Brand Name."),
      brandCode: z.string().min(1, " Please enter Brand Code."),
      status: z
        .enum(["Active", "Inactive"], " Please select Status.")
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
        message: " Please select Company.",
        path: ["companyId"],
      },
    )
    .refine((data) => !!data.manufacturerId, {
      message: " Please select Manufacturer.",
      path: ["manufacturerId"],
    });
};

