import { z } from "zod";

const phoneRegex = /^[0-9]{6,15}$/;

export const userAddSchema = z.object({
  firstName: z
    .string()
    .min(2, "Please enter a first name of at least 2 characters")
    .max(100),
  lastName: z
    .string()
    .min(2, "Please enter a last name of at least 2 characters")
    .max(100),
  userName: z
    .string()
    .min(3, "Please enter a username of at least 3 characters")
    .max(100)
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Please use only letters, numbers, dots, hyphens and underscores for username",
    ),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(5, "Please enter a password of at least 6 characters"),
  companyId: z.coerce
    .number({ required_error: "Please select a company" })
    .min(1, "Please select a company"),
  groupId: z.coerce
    .number({ required_error: "Please select a group" })
    .min(1, "Please select a group"),
  dialCode: z.string().optional().nullable(),
  phone: z
    .string()
    .regex(phoneRegex, "Please enter a valid phone number")
    .optional()
    .nullable()
    .or(z.literal("")),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  isSuperAdmin: z.coerce.boolean().default(false),
});

export const userEditSchema = userAddSchema
  .omit({ password: true })
  .extend({
    id: z.coerce.number({ required_error: "Please provide a user ID" }),
    password: z.string().min(5, "Please enter a password of at least 6 characters").optional().or(z.literal("")),
  });
