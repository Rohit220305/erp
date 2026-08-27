import { z } from "zod";

export const getBomSchema = (isSuperAdmin = false) => {
  return z
    .object({
      id: z.any().optional().nullable(),
      companyId: z
        .number()
        .or(z.string().transform((val) => (val ? Number(val) : undefined)))
        .optional()
        .nullable(),
      bomName: z.string({ required_error: "⚠ Please enter BOM Name." }).trim().min(1, "⚠ Please enter BOM Name."),
      bomCode: z.string().trim().optional().nullable(),
      productionMethod: z.enum(["process", "discrete"], {
        errorMap: () => ({ message: "⚠ Please select Production Method." }),
      }),
      itemId: z.coerce.number({ required_error: "⚠ Please select Output Item." }).min(1, "⚠ Please select Output Item."),
      processTemplateId: z.coerce.number({ required_error: "⚠ Please select Process Template." }).min(1, "⚠ Please select Process Template."),
      customerId: z.coerce.number().optional().nullable(),
      referenceNumber: z.string().trim().optional().nullable(),
      remarks: z.string().trim().optional().nullable(),
      status: z
        .enum(["Active", "Inactive"], {
          errorMap: () => ({ message: "⚠ Please select Status." }),
        })
        .default("Active"),
      retainedAttachments: z.any().optional().nullable(),
      attachments: z.any().optional().nullable(),
      items: z
        .array(
          z.object({
            id: z.any().optional().nullable(),
            processTemplateMappingId: z.coerce.number({ required_error: "⚠ Missing process template mapping." }).min(1),
            materialType: z.preprocess(
              (val) => {
                if (!val) return "Entry";
                const str = String(val).toLowerCase();
                if (str === "exit" || str === "by_product" || str === "co_product") return "Exit";
                return "Entry";
              },
              z.enum(["Entry", "Exit"], {
                errorMap: () => ({ message: "⚠ Please select Material Type." }),
              })
            ),
            itemId: z.coerce.number({ required_error: "⚠ Please select Material Item." }).min(1, "⚠ Please select Material Item."),
            quantity: z.coerce.number({ required_error: "⚠ Please enter Quantity." }).gt(0, "⚠ Quantity must be greater than 0."),
            isInternalTransfer: z.boolean().optional().default(false),
            isPrimary: z.enum(["Yes", "No"]).optional().default("No"),
          })
        )
        .min(1, "⚠ Please add at least one material item in Step 2."),
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
