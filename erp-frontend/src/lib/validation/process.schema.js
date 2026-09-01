import { z } from "zod";

export const getProcessSchema = (isSuperAdmin = false) => {
  return z
    .object({
      companyId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      workCentreId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      processName: z.string().min(1, " Please enter Process Name."),
      processCode: z.string().min(1, " Please enter Process Code."),
      description: z.string().optional(),
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
    .refine((data) => !!data.workCentreId, {
      message: " Please select Work Centre.",
      path: ["workCentreId"],
    });
};
