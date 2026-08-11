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




// Viewed user.controller.ts:37-68

// We did not implement `ValidateFilePipe` (`validate-file.pipe.ts`) because of a specific requirement you mentioned during our planning phase. 

// You noted that the frontend requires a strict JSON response format of `{ success: 0, message: 'Invalid File' }` when a file fails validation. 

// If we used a standard NestJS Pipe (`ValidateFilePipe`), it would throw an exception that bypasses the controller and typically returns a standard HTTP error structure (unless we wrote a custom exception filter specifically for it). 

// To keep things simple and ensure the frontend gets the exact `{ success: 0 }` response it expects, we decided to use a **helper method** instead of a Pipe. 

// The validation logic was implemented as `validateAndCleanUp` inside `CommonFileService` (`src/package/service/common-file.service.ts`). You can see it being used directly in the controller here:

// ```typescript
// // inside user.controller.ts
// if (file) {
//   const fileCheck = await this.commonFileService.validateAndCleanUp(file);
//   if (!fileCheck.valid) return fileCheck.error; // Returns exactly { success: 0, message: 'Invalid File' }
//   params.profilePhoto = file.filename;
// }
// ```

// Would you still prefer to move this logic into a custom `ValidateFilePipe` along with a custom Exception Filter to catch it and format the `{ success: 0 }` response?