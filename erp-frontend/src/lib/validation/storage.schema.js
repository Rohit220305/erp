import { z } from "zod";

export const getStorageSchema = (isSuperAdmin = false) => {
  return z
    .object({
      companyId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      storageName: z.string().min(1, "Please enter Storage Name."),
      storageCode: z.string().min(1, "Please enter Storage Code."),
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
