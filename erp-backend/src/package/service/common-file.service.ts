import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { pipeline } from 'stream/promises';
import { validate } from 'class-validator';
import { CommonFileDto } from '../dto/common-file.dto';

@Injectable()
export class CommonFileService {
  async transferFile(fileName: string, recordId: number, folderName: string) {
    try {
      const uploadsDir = process.env.UPLOAD_DIR || './uploads';

      const tempDir = process.env.TEMP_DIR || './temp-uploads';

      const destinationFolder = path.join(
        uploadsDir,
        folderName,
        `${recordId}`,
      );

      const sourceFile = path.join(tempDir, fileName);

      const destinationFile = path.join(destinationFolder, fileName);

      if (fs.existsSync(destinationFolder)) {
        await this.deleteFolder(folderName, `${recordId}`);
      }

      if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder, {
          recursive: true,
        });
      }

      await pipeline(
        fs.createReadStream(sourceFile),
        fs.createWriteStream(destinationFile),
      );

      await this.deleteTempFile(fileName);

      return {
        success: 1,
        message: 'File transferred successfully',
      };
    } catch (err) {

      return {
        success: 0,
        message: 'File transfer failed',
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
}
