import { z } from "zod";

const requiredNumber = (message) => z.any()
  .refine((val) => val !== "" && val !== null && val !== undefined, message)
  .transform((val) => Number(val))
  .refine((val) => !isNaN(val) && val >= 0, message);

export const generateZodSchema = (fields = [], context = {}) => {
  const schemaObj = {};

  fields.forEach(field => {

    const msg = field.validation?.message || `Please select ${field.label || field.key}.`;


    if (field.superAdminOnly === true && context.isSuperAdmin === false) {
      schemaObj[field.key] = z.any().optional().nullable();
      return;
    }

    let fieldSchema;
    const isRequired = field.required === true;


    if (field.validation?.enum && Array.isArray(field.validation.enum)) {
      fieldSchema = z.enum(field.validation.enum, { errorMap: () => ({ message: msg }) });
      if (!isRequired) {
        fieldSchema = fieldSchema.optional().nullable();
      }
    } else {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'textarea':
          fieldSchema = isRequired
            ? z.string().trim().min(1, msg)
            : z.string().trim().optional().nullable();
          break;

        case 'number':
          fieldSchema = isRequired
            ? requiredNumber(msg)
            : z.coerce.number().optional().nullable();
          break;

        case 'select':
        case 'async-select':
          if (isRequired) {
            fieldSchema = field.valueType === "number"
              ? z.coerce.number().min(1, msg)
              : z.string().min(1, msg);
          } else {
            fieldSchema = z.any().optional().nullable();
          }
          break;

        case 'multi-select':
          fieldSchema = isRequired
            ? z.array(z.any()).min(1, msg)
            : z.array(z.any()).optional().nullable();
          break;

        case 'date':
          fieldSchema = isRequired
            ? z.string().min(1, msg)
            : z.string().optional().nullable();
          break;

        case 'toggle':
          fieldSchema = isRequired
            ? z.boolean()
            : z.boolean().default(false);
          break;

        case 'radio':
          fieldSchema = isRequired
            ? z.string().min(1, msg)
            : z.string().optional().nullable();
          break;

        case 'phone':
          fieldSchema = isRequired
            ? z.object({ code: z.string(), number: z.string().min(1, msg) })
            : z.any().optional().nullable();
          break;

        case 'image-upload':
        case 'file-upload':
          fieldSchema = isRequired
            ? z.any().refine(v => !!v, msg)
            : z.any().optional().nullable();
          break;

        case 'multi-image-upload':
          fieldSchema = z.any().optional();
          break;

        default:
          fieldSchema = z.any().optional().nullable();
          break;
      }
    }


    if (field.defaultValue !== undefined && field.defaultValue !== null) {
      fieldSchema = fieldSchema.default(field.defaultValue);
    }

    schemaObj[field.key] = fieldSchema;
  });

  return z.object(schemaObj);
};
