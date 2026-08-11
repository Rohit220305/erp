import { z } from "zod";
const schema = z.object({
  unitType: z.enum(["length"], {
    errorMap: (issue, ctx) => {
      return { message: "⚠ Please select Unit Type" };
    }
  }),
});
const res = schema.safeParse({ unitType: "" });
console.log(res.error.issues);
