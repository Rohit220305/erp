import { z } from "zod";

export const loginSchema = z.object({
  userName: z.string().trim().min(1, "Please enter Username"),

  password: z.string().trim().min(1, "Please enter Password"),
});

