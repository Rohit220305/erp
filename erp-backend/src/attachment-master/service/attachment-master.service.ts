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

 
  private getFolderName(companyId: number, moduleName: AttachmentModule): string {
    return `${moduleName.toLowerCase()}/attachments`;
  }


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

      const existing = await this.attachmentRepo.findOne({
        where: { companyId, moduleName, entityId },
      });

      const fileResponse = await this.commonFileService.transferFile(
        storedFileName,
        entityId,
        folderName,
      );

      if (fileResponse.success === 0) {
        return { success: 0, message: 'File transfer failed' };
      }

      if (existing) {
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

      const dbAttachments = await this.attachmentRepo.find({
        where: { companyId, moduleName, entityId },
      });

      const retainedIds = new Set<number>();
      const retainedStoredNames = new Set<string>();

      for (const item of (retainedAttachments || [])) {
        if (typeof item === 'number' || typeof item === 'string') {
          const numId = Number(item);
          if (!isNaN(numId)) retainedIds.add(numId);
        } else if (item && typeof item === 'object') {
          if (item.id) retainedIds.add(Number(item.id));
          if (item.storedFileName) retainedStoredNames.add(String(item.storedFileName));
        }
      }

      const retainedDbAttachments = dbAttachments.filter(
        (att) => retainedIds.has(Number(att.id)) || retainedStoredNames.has(att.storedFileName)
      );

      const retainedStoredNamesFinal = new Set(retainedDbAttachments.map((a) => a.storedFileName));

      for (const dbAtt of dbAttachments) {
        if (!retainedStoredNamesFinal.has(dbAtt.storedFileName)) {
          await this.commonFileService.deleteFile(
            folderName,
            `${entityId}`,
            dbAtt.storedFileName
          ).catch(() => null);
        }
      }

      await this.attachmentRepo.delete({ companyId, moduleName, entityId });

      const attachmentInserts: any[] = [];

      for (const retAtt of retainedDbAttachments) {
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

      if (newFiles && newFiles.length > 0) {
        const successfullyTransferredStoredNames: string[] = [];

        try {
          for (const file of newFiles) {
            const storedFileName = file.filename || file.storedFileName;
            if (!storedFileName) {
              throw new Error(`File name missing for uploaded file ${file.originalname || 'unknown'}`);
            }

            const fileResponse = await this.commonFileService.transferFile(
              storedFileName,
              entityId,
              folderName
            );

            if (fileResponse.success === 0) {
              throw new Error(`File transfer failed for ${file.originalname || storedFileName}: ${fileResponse.message}`);
            }

            successfullyTransferredStoredNames.push(storedFileName);

            attachmentInserts.push({
              companyId,
              moduleName,
              entityId,
              fileName: file.originalname || file.filename || storedFileName,
              storedFileName: storedFileName,
              mimeType: file.mimetype || 'application/pdf',
              fileSize: file.size || 0,
            });
          }
        } catch (error: any) {
          for (const storedName of successfullyTransferredStoredNames) {
            await this.commonFileService.deleteFile(
              folderName,
              `${entityId}`,
              storedName
            ).catch(() => null); 
          }
          throw error;
        }
      }

      if (attachmentInserts.length > 0) {
        await this.attachmentRepo.insert(attachmentInserts);
      }

      return { success: 1, message: 'Attachments synced successfully' };
    } catch (err: any) {
      return { success: 0, message: err.message };
    }
  }

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
        originalFileName: attachment.fileName,
        url,
      };
    } catch (err) {
      return null;
    }
  }

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
            originalFileName: att.fileName,
            url,
          };
        }),
      );

      return listWithUrls;
    } catch (err) {
      return [];
    }
  }

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
