import { z } from "zod";

export const loginSchema = z.object({
  userName: z.string().trim().min(3, "Please enter Username"),

  password: z.string().trim().min(3, "Please enter valid Password"),
});

