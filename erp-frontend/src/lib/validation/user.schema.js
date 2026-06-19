import { z } from "zod";

const phoneRegex = /^[0-9]{6,15}$/;

export const userAddSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(100),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(100),
  userName: z.string().min(3, "Username must be at least 3 characters").max(100).regex(/^[a-zA-Z0-9._-]+$/, "Username can only contain letters, numbers, dots, hyphens and underscores"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(5, "Password must be at least 6 characters"),
  companyId: z.coerce.number({ required_error: "Company is required" }).min(1, "Company is required"),
  groupId: z.coerce.number({ required_error: "Group is required" }).min(1, "Group is required"),
  dialCode: z.string().optional(),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number").optional().or(z.literal("")),
  status: z.enum(["Active", "InActive"]).default("Active"),
  isSuperAdmin: z.boolean().default(false),
});

export const userEditSchema = userAddSchema
  .omit({ password: true })
  .extend({
    id: z.coerce.number({ required_error: "User ID is required" }),
    password: z.string().min(5, "Password must be at least 6 characters").optional().or(z.literal("")),
  });
