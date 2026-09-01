import { z } from "zod";

export const getWorkCentreSchema = (isSuperAdmin = false) => {
  return z
    .object({
      companyId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      categoryId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      workCentreName: z.string().min(1, " Please enter Work Centre Name."),
      workCentreCode: z.string().min(1, " Please enter Work Centre Code."),
      usageStatus: z.enum(
        ["Available", "Inuse", "Maintenance"],
        " Please select Usage Status.",
      ),
      status: z.enum(["Active", "Inactive"], " Please select Status."),
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
    .refine((data) => !!data.categoryId, {
      message: " Please select Category.",
      path: ["categoryId"],
    });
};
