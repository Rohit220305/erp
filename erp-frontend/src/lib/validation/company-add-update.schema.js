import { z } from "zod";

const phoneRegex = /^[0-9+\-\s()]+$/;

export const companyAddSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Please enter Company Name.")
    .max(255, "Company Name cannot exceed 255 characters."),

  parentCompanyId: z.union([z.number(), z.string()]).optional().nullable(),

  shortName: z
    .string()
    .trim()
    .min(1, "Please enter Short Name.")
    .max(100, "Short Name cannot exceed 100 characters."),

  legalName: z
    .string()
    .trim()
    .max(255, "Legal Name cannot exceed 255 characters.")
    .optional()
    .or(z.literal("")),

  registrationNumber: z
    .string()
    .trim()
    .max(100, "Registration Number cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),

  taxNumber: z
    .string()
    .trim()
    .max(100, "Tax Number cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),

  website: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\/[^\s]*)?$/i.test(
          value,
        ),
      {
        message: "Please enter a valid website URL.",
      },
    ),

  email: z
    .string()
    .trim()
    .min(1, "Please enter Email.")
    .email("Please enter a valid Email Address."),

  dialCode: z.string().trim().min(1, "Please select Dial Code."),

  phone: z
    .string()
    .trim()
    .min(1, "Please enter Phone Number.")
    .max(20)
    .regex(phoneRegex, "Please enter a valid Phone Number."),

  addressLine1: z.string().trim().min(1, "Please enter Address.").max(255),

  addressLine2: z.string().trim().max(255).optional().or(z.literal("")),

  country: z.string().trim().min(1, "Please select Country."),

  state: z.string().trim().min(1, "Please select State."),

  city: z.string().trim().min(1, "Please enter City."),

  zipCode: z.string().trim().min(1, "Please enter Zip Code.").max(20),

  contactPersonName: z.string().trim().max(255).optional().or(z.literal("")),

  contactPersonEmail: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "Please enter a valid Contact Person Email.",
    }),

  contactPersonPhone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || phoneRegex.test(value), {
      message: "Please enter a valid Contact Person Phone.",
    }),

  status: z.enum(["Active", "Inactive"], {
    errorMap: () => ({
      message: "Please select Status.",
    }),
  }),
});


export const companyEditSchema = companyAddSchema.extend({
  id: z.number({
    required_error: "Company Id is required.",
  }),
});