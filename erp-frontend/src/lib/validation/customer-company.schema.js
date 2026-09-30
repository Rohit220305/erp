import { z } from "zod";

const addressSchema = z.object({
  address: z.string().min(1, "Address is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  phoneCode: z.string().optional(),
  phoneNumber: z.string().min(1, "Phone Number is required"),
  altPhoneCode: z.string().optional(),
  altPhoneNumber: z.string().optional(),
});

const ownerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dob: z.string().optional(),
  customDate: z.string().optional(),
  phoneCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  altPhoneCode: z.string().optional(),
  altPhoneNumber: z.string().optional(),
  isOwner: z.any().transform(v => Boolean(Number(v))).optional().default(true),
});

export const customerCompanySchema = z.object({
  name: z.string().min(1, "Company Name is required"),
  shortName: z.string().min(1, "Short Name is required"),
  code: z.string().min(1, "Company Code is required"),
  email: z.string().email("Invalid email").min(1, "Company Email is required"),
  incorporationDate: z.string().min(1, "Incorporation Date is required"),
  referenceCode: z.string().optional(),
  remark: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  address: addressSchema,
  owner: ownerSchema,
});
