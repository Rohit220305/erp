import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttachmentMasterEntity } from '../entity/attachment-master.entity';
import { AttachmentModule } from '../enums/attachment-module.enum';
import { CommonFileService } from 'src/package/service/common-file.service';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class AttachmentMasterService {
  constructor(
    @InjectRepository(AttachmentMasterEntity)
    private readonly attachmentRepo: Repository<AttachmentMasterEntity>,
    private readonly commonFileService: CommonFileService,
    private readonly general: GeneralUtilities,
  ) {}

  /**
   * Helper to resolve the target subfolder for file uploads
   */
  private getFolderName(companyId: number, moduleName: AttachmentModule): string {
    return `company_${companyId}/${moduleName.toLowerCase()}/attachments`;
  }

  /**
   * Save or replace attachment for a company and module record
   */
  async saveAttachment(
    fileOrFileName: any,
    companyId: number,
    moduleName: AttachmentModule,
    entityId: number,
    originalName?: string,
    mimeType?: string,
    fileSize?: number,
  ) {
    try {
      if (!fileOrFileName || !companyId || !entityId) return null;

      let storedFileName: string;
      let fileName: string;
      let fileMimeType: string;
      let fileSizeBytes: number;

      if (typeof fileOrFileName === 'string') {
        storedFileName = fileOrFileName;
        fileName = originalName || fileOrFileName;
        fileMimeType = mimeType || 'application/pdf';
        fileSizeBytes = fileSize || 0;
      } else {
        storedFileName = fileOrFileName.filename;
        fileName = originalName || fileOrFileName.originalname || fileOrFileName.filename;
        fileMimeType = mimeType || fileOrFileName.mimetype || 'application/pdf';
        fileSizeBytes = fileSize || fileOrFileName.size || 0;
      }

      const folderName = this.getFolderName(companyId, moduleName);

      // Check if an attachment record already exists
      const existing = await this.attachmentRepo.findOne({
        where: { companyId, moduleName, entityId },
      });

      // Transfer file from temp upload directory to permanent storage
      const fileResponse = await this.commonFileService.transferFile(
        storedFileName,
        entityId,
        folderName,
      );

      if (fileResponse.success === 0) {
        return { success: 0, message: 'File transfer failed' };
      }

      if (existing) {
        // Clean up previous stored file if file name changed
        if (existing.storedFileName !== storedFileName) {
          await this.commonFileService.deleteFile(
            folderName,
            `${entityId}`,
            existing.storedFileName,
          );
        }

        existing.fileName = fileName;
        existing.storedFileName = storedFileName;
        existing.fileSize = fileSizeBytes;
        existing.mimeType = fileMimeType;

        const updated = await this.attachmentRepo.save(existing);
        return { success: 1, data: updated };
      }

      const newAttachment = this.attachmentRepo.create({
        companyId,
        moduleName,
        entityId,
        fileName,
        storedFileName,
        fileSize: fileSizeBytes,
        mimeType: fileMimeType,
      });

      const saved = await this.attachmentRepo.save(newAttachment);
      return { success: 1, data: saved };
    } catch (err) {
      return { success: 0, message: err.message };
    }
  }

  /**
   * Sync multiple attachments for an entity (like Item module's multi-image flow)
   */
  async syncMultipleAttachments(
    companyId: number,
    moduleName: AttachmentModule,
    entityId: number,
    retainedAttachments: any[],
    newFiles: any[]
  ) {
    try {
      if (!companyId || !entityId) return { success: 0, message: 'Missing parameters' };

      const folderName = this.getFolderName(companyId, moduleName);

      // Fetch all existing DB attachments for this entity
      const dbAttachments = await this.attachmentRepo.find({
        where: { companyId, moduleName, entityId },
      });

      // Bulk delete all from DB
      await this.attachmentRepo.delete({ companyId, moduleName, entityId });

      // Build Set of retained storedFileNames
      const retainedStoredNames = new Set(retainedAttachments.map(att => att.storedFileName));

      // Physically delete files that are not retained
      for (const dbAtt of dbAttachments) {
        if (!retainedStoredNames.has(dbAtt.storedFileName)) {
          await this.commonFileService.deleteFile(
            folderName,
            `${entityId}`,
            dbAtt.storedFileName
          );
        }
      }

      const attachmentInserts: any[] = [];

      // Add retained ones to inserts array
      for (const retAtt of retainedAttachments) {
        attachmentInserts.push({
          companyId,
          moduleName,
          entityId,
          fileName: retAtt.fileName,
          storedFileName: retAtt.storedFileName,
          mimeType: retAtt.mimeType,
          fileSize: retAtt.fileSize,
        });
      }

      // Transfer new files with compensating rollback
      if (newFiles && newFiles.length > 0) {
        const successfullyTransferredStoredNames: string[] = [];

        try {
          for (const file of newFiles) {
            const storedFileName = file.filename;
            const fileResponse = await this.commonFileService.transferFile(
              storedFileName,
              entityId,
              folderName
            );

            if (fileResponse.success === 0) {
              throw new Error(`File transfer failed for ${file.originalname}`);
            }

            successfullyTransferredStoredNames.push(storedFileName);

            attachmentInserts.push({
              companyId,
              moduleName,
              entityId,
              fileName: file.originalname || file.filename,
              storedFileName: storedFileName,
              mimeType: file.mimetype || 'application/pdf',
              fileSize: file.size || 0,
            });
          }
        } catch (error) {
          // Compensating rollback: Delete newly transferred files
          for (const storedName of successfullyTransferredStoredNames) {
            await this.commonFileService.deleteFile(
              folderName,
              `${entityId}`,
              storedName
            ).catch(() => null); // ignore if already deleted
          }
          throw error;
        }
      }

      // Bulk insert
      if (attachmentInserts.length > 0) {
        await this.attachmentRepo.insert(attachmentInserts);
      }

      return { success: 1, message: 'Attachments synced successfully' };
    } catch (err) {
      return { success: 0, message: err.message };
    }
  }

  /**
   * Retrieve active attachment record with dynamic viewable URL
   */
  async getAttachmentByEntity(
    companyId: number,
    moduleName: AttachmentModule,
    entityId: number,
  ) {
    try {
      if (!companyId || !entityId) return null;

      const attachment = await this.attachmentRepo.findOne({
        where: { companyId, moduleName, entityId },
      });

      if (!attachment) return null;

      const folderName = this.getFolderName(companyId, moduleName);
      const url = await this.general.generateUrl(
        folderName,
        `${entityId}`,
        attachment.storedFileName,
      );

      return {
        ...attachment,
        url,
      };
    } catch (err) {
      return null;
    }
  }

  /**
   * Retrieve active attachment records with dynamic viewable URLs for an entity
   */
  async getAttachmentsByEntity(
    companyId: number,
    moduleName: AttachmentModule,
    entityId: number,
  ) {
    try {
      if (!companyId || !entityId) return [];

      const attachments = await this.attachmentRepo.find({
        where: { companyId, moduleName, entityId },
      });

      if (!attachments || attachments.length === 0) return [];

      const folderName = this.getFolderName(companyId, moduleName);

      const listWithUrls = await Promise.all(
        attachments.map(async (att) => {
          const url = await this.general.generateUrl(
            folderName,
            `${entityId}`,
            att.storedFileName,
          );
          return {
            ...att,
            url,
          };
        }),
      );

      return listWithUrls;
    } catch (err) {
      return [];
    }
  }

  /**
   * Delete attachment file and DB record for an entity
   */
  async deleteAttachmentByEntity(
    companyId: number,
    moduleName: AttachmentModule,
    entityId: number,
  ) {
    try {
      if (!companyId || !entityId) return true;

      const attachment = await this.attachmentRepo.findOne({
        where: { companyId, moduleName, entityId },
      });

      if (attachment) {
        const folderName = this.getFolderName(companyId, moduleName);
        await this.commonFileService.deleteFile(
          folderName,
          `${entityId}`,
          attachment.storedFileName,
        );
        await this.attachmentRepo.delete({ id: attachment.id });
      }

      return true;
    } catch (err) {
      return false;
    }
  }
}
