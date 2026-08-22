import { z } from "zod";

export const getProcessTemplateSchema = (isSuperAdmin = false) => {
  return z
    .object({
      companyId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional(),
      templateName: z.string().min(1, "⚠ Please enter Template Name."),
      templateCode: z.string().min(1, "⚠ Please enter Template Code."),
      executionType: z.enum(["Sequential", "Flexible"], {
        errorMap: () => ({ message: "⚠ Please select Execution Type." }),
      }).default("Sequential"),
      remark: z.string().optional(),
      status: z.enum(["Active", "Inactive"], {
        errorMap: () => ({ message: "⚠ Please select Status." }),
      }).default("Active"),
      processes: z
        .array(
          z.object({
            processId: z
              .number()
              .or(z.string().transform((val) => Number(val))),
            sequenceNo: z
              .number()
              .or(z.string().transform((val) => Number(val))),
            dependencies: z.array(z.number()).optional(),
          })
        )
        .min(1, "⚠ Please add at least one process in the sequence grid."),
    })
    .refine(
      (data) => {
        if (isSuperAdmin && !data.companyId) {
          return false;
        }
        return true;
      },
      {
        message: "⚠ Please select Company.",
        path: ["companyId"],
      }
    );
};
