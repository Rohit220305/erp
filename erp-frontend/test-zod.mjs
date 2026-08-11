import { z } from "zod";
const schema = z.object({
  unitType: z.enum(["length", "temperature"], {
    errorMap: () => ({ message: "⚠ Please select Unit Type" }),
  }),
  unitType2: z.enum(["length", "temperature"], {
    invalid_type_error: "⚠ Please select Unit Type",
    required_error: "⚠ Please select Unit Type",
  })
});
console.log("errorMap error:", schema.safeParse({ unitType: "", unitType2: "" }).error.issues);
