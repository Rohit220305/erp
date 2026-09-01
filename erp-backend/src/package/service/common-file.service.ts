import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { pipeline } from 'stream/promises';
import { validate } from 'class-validator';
import { CommonFileDto } from '../dto/common-file.dto';

@Injectable()
export class CommonFileService {
  async transferFile(fileNames: string | string[], recordId: number, folderName: string) {
    try {
      const uploadsDir = process.env.UPLOAD_DIR || './uploads';
      const tempDir = process.env.TEMP_DIR || './temp-uploads';
      const destinationFolder = path.join(
        uploadsDir,
        folderName,
        `${recordId}`,
      );

      if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder, {
          recursive: true,
        });
      }

      const filesToTransfer = Array.isArray(fileNames) ? fileNames : [fileNames];

      for (const fileName of filesToTransfer) {
        const sourceFile = path.join(tempDir, fileName);
        const destinationFile = path.join(destinationFolder, fileName);

        if (fs.existsSync(sourceFile)) {
          await pipeline(
            fs.createReadStream(sourceFile),
            fs.createWriteStream(destinationFile),
          );
          await this.deleteTempFile(fileName);
        }
      }

      return {
        success: 1,
        message: 'File(s) transferred successfully',
      };
    } catch (err) {
      return {
        success: 0,
        message: 'File(s) transfer failed',
      };
    }
  }

  async deleteTempFile(fileName: string) {
    try {
      const tempDir = process.env.TEMP_DIR || './temp-uploads';

      const tempFile = path.join(tempDir, fileName);

      if (fs.existsSync(tempFile)) {
        await fs.promises.unlink(tempFile);
      }

      return true;
    } catch (err) {

      return false;
    }
  }

  async deleteFolder(folderName: string, subFolder: string) {
    try {
      const uploadsDir = process.env.UPLOAD_DIR || './uploads';

      const folderPath = path.join(uploadsDir, folderName, subFolder);

      if (fs.existsSync(folderPath)) {
        await fs.promises.rm(folderPath, {
          recursive: true,
          force: true,
        });
      }

      return true;
    } catch (err) {
      return false;
    }
  }

  async deleteFile(folderName: string, subFolder: string, fileName: string) {
    try {
      const uploadsDir = process.env.UPLOAD_DIR || './uploads';
      const filePath = path.join(uploadsDir, folderName, subFolder, fileName);

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  async validateAndCleanUp(file: any): Promise<{ valid: boolean; error?: any }> {
    if (!file) {
      return { valid: true };
    }

    const fileDto = new CommonFileDto();
    fileDto.file = file.mimetype;
    const errors = await validate(fileDto);

    if (errors.length > 0) {
      await this.deleteTempFile(file.filename);
      return {
        valid: false,
        error: {
          success: 0,
          message: 'Invalid File',
        },
      };
    }

    return { valid: true };
  }

  async validateDocumentAndCleanUp(file: any): Promise<{ valid: boolean; error?: any }> {
    if (!file) {
      return { valid: true };
    }

    const allowedDocumentTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedDocumentTypes.includes(file.mimetype)) {
      await this.deleteTempFile(file.filename);
      return {
        valid: false,
        error: {
          success: 0,
          message: 'Invalid File',
        },
      };
    }

    return { valid: true };
  }
}
