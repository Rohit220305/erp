import { z } from "zod";
const schema = z.object({
  unitType: z.string().min(1, "⚠ Please select Unit Type").refine(val => ["length", "temperature", "density", "volume", "weight", "time", "pumping_rate"].includes(val), { message: "⚠ Please select Unit Type" })
});
console.log(schema.safeParse({ unitType: "" }).error.issues);
console.log(schema.safeParse({ unitType: "length" }).error);
