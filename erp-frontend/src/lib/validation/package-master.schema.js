import { z } from "zod";

export const getPackageSchema = (isSuperAdmin = false) => {
  return z
    .object({
      companyId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      packageName: z.string().min(1, "Please enter Package Type Name."),
      packageCode: z.string().min(1, "Please enter Package Type Code."),
      abbreviation: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
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
