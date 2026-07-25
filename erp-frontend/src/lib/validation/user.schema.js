import { z } from "zod";

const phoneRegex = /^[0-9]{6,15}$/;

export const userAddSchema = z.object({
  firstName: z
    .string()
    .min(2, "Please enter a First Name.")
    .max(100),
  lastName: z
    .string()
    .min(2, "Please enter a Last Name.")
    .max(100),
  userName: z
    .string()
    .min(3, "Please enter a Username of at least 3 characters.")
    .max(100)
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Invalid Username.",
    ),
  email: z.string().email("Please enter a valid Email."),
  password: z
    .string()
    .min(5, "Please enter a password of at least 6 characters"),
  companyId: z.coerce
    .number({ required_error: "Please select a Company." })
    .min(1, "Please select a company"), 
  groupIds: z
    .array(z.coerce.number())
    .min(1, "Please select at least one Role / Group."),
  dialCode: z.string().optional().nullable(),
  phone: z
    .string()
    .regex(phoneRegex, "Please enter valid Phone Number.")
    .optional()
    .nullable()
    .or(z.literal("")),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  isSuperAdmin: z.coerce.boolean().default(false),
});

export const userEditSchema = userAddSchema
  .omit({ password: true })
  .extend({
    id: z.coerce.number({ required_error: "Please provide a user ID." }),
    password: z.string().min(5, "Please enter a password of at least 6 characters.").optional().or(z.literal("")),
  });
