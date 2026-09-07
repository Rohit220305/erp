import { z } from "zod";

const phoneRegex = /^[0-9]{6,15}$/;

const baseUserShape = {
  firstName: z
    .string()
    .min(2, "Please enter First Name.")
    .max(100),
  lastName: z
    .string()
    .min(2, "Please enter Last Name.")
    .max(100),
  userName: z
    .string()
    .min(3, "Please enter Username (at least 3 characters).")
    .max(100)
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Please enter a valid Username.",
    ),
  email: z.string().email("Please enter a valid Email."),
  companyId: z.coerce
    .number()
    .optional()
    .nullable()
    .or(z.literal("")),
  groupIds: z
    .array(z.coerce.number())
    .optional()
    .default([]),
  dialCode: z.string().optional().nullable(),
  phone: z
    .string()
    .regex(phoneRegex, "Please enter a valid Phone Number.")
    .optional()
    .nullable()
    .or(z.literal("")),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  isSuperAdmin: z.coerce.boolean().default(false),
};

const validateSuperAdminRequirements = (data, ctx) => {
  if (!data.isSuperAdmin) {
    if (!data.companyId || Number(data.companyId) < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select Company.",
        path: ["companyId"],
      });
    }
    if (!data.groupIds || !Array.isArray(data.groupIds) || data.groupIds.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select Roles / Groups.",
        path: ["groupIds"],
      });
    }
  }
};

export const userAddSchema = z
  .object({
    ...baseUserShape,
    password: z
      .string()
      .min(6, "Please enter Password (at least 6 characters)."),
  })
  .superRefine(validateSuperAdminRequirements);

export const userEditSchema = z
  .object({
    ...baseUserShape,
    id: z.coerce.number({ required_error: "Please provide User ID." }),
    password: z
      .string()
      .min(6, "Please enter Password (at least 6 characters).")
      .optional()
      .or(z.literal("")),
  })
  .superRefine(validateSuperAdminRequirements);
