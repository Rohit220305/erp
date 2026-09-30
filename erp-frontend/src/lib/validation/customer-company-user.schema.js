import { z } from "zod";

export const getCustomerCompanyUserSchema = (isSuperAdmin = false) => {
  return z
    .object({
      companyId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      customerCompanyId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      code: z.string().optional(),
      firstName: z.string().min(1, " Please enter First Name."),
      lastName: z.string().min(1, " Please enter Last Name."),
      email: z.string().min(1, " Please enter Email Address.").email(" Please enter a valid Email Address."),
      dob: z.string().optional(),
      customDate: z.string().optional(),
      isOwner: z
        .boolean()
        .or(z.string().transform((v) => v === "true" || v === "1"))
        .optional(),
      phoneCode: z.string().optional(),
      phoneNumber: z.string().optional(),
      altPhoneCode: z.string().optional(),
      altPhoneNumber: z.string().optional(),
      status: z
        .enum(["Active", "Inactive"], " Please select Status.")
        .default("Active"),
      address: z.object({
        address: z.string().optional(),
        country: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        zipCode: z.string().optional(),
        phoneCode: z.string().optional(),
        phoneNumber: z.string().optional(),
        altPhoneCode: z.string().optional(),
        altPhoneNumber: z.string().optional(),
      }).optional(),
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
      }
    )
    .refine((data) => !!data.customerCompanyId, {
      message: " Please select Customer Company.",
      path: ["customerCompanyId"],
    });
};
