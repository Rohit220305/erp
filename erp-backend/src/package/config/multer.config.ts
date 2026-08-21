import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: process.env.TEMP_DIR || './temp-uploads',

    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

      const extension = extname(file.originalname);

      callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    },
  }),

  fileFilter: (req, file, callback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error('Only jpg, jpeg, png and webp files are allowed'),
        false,
      );
    }
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};


