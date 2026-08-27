import { diskStorage } from 'multer';
import { extname } from 'path';

export interface MulterOptions {
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

export const ALLOWED_DOCUMENT_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
];

/**
 * Factory function to create custom Multer configurations dynamically
 */
export const createMulterConfig = (options?: MulterOptions) => {
  const allowedTypes = options?.allowedMimeTypes || ALLOWED_DOCUMENT_TYPES;
  const maxSizeBytes = options?.maxSizeBytes || 100 * 1024 * 1024; // Default 100MB

  return {
    storage: diskStorage({
      destination: process.env.TEMP_DIR || './temp-uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error(`Invalid file type: ${file.mimetype}`), false);
      }
    },
    limits: {
      fileSize: maxSizeBytes,
    },
  };
};

/**
 * Predefined Presets
 */
// 1. Strict image-only upload (5MB max) - Used for User Avatars, Item Images, Brand Logos
export const imageMulterConfig = createMulterConfig({
  allowedMimeTypes: ALLOWED_IMAGE_TYPES,
  maxSizeBytes: 5 * 1024 * 1024,
});

// 2. Generic document upload (100MB max) - Used for BOM, Process, Attachments
export const documentMulterConfig = createMulterConfig({
  allowedMimeTypes: ALLOWED_DOCUMENT_TYPES,
  maxSizeBytes: 100 * 1024 * 1024,
});

// Backward-compatibility alias
export const multerConfig = imageMulterConfig;
