import { z } from "zod";

export const groupAddSchema = z.object({
  groupCode: z
    .string()
    .min(1, "Please enter Group Code.")
    .min(2, "Group code must be at least 2 characters.")  
    .max(20, "Group code must be at most 20 characters.")
    .regex(
      /^[A-Z0-9_-]+$/i,
      "Group code can only contain letters, numbers, hyphens and underscores.",
    ),
  groupName: z
    .string()
    .min(1, "Please enter Group Name.")
    .min(2, "Group name must be at least 2 characters.")
    .max(100, "Group name must be at most 100 characters."),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters.")
    .optional(),
  status: z
    .enum(["Active", "Inactive"], "Please select Status.")
    .default("Active"),
});

export const groupEditSchema = groupAddSchema.extend({
  id: z.coerce.number({ required_error: "Group ID is required" }),
});
