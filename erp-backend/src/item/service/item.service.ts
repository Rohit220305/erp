import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ItemEntity } from '../entity/item.entity';
import { ItemImageEntity } from '../entity/item-image.entity';
import { GeneralUtilities } from '../../package/utilities/general.utilities';
import { ActivityLogService } from '../../activity-log/service/activity-log.service';
import { CommonFileService } from '../../package/service/common-file.service';
import { YesNo } from '../../package/common/enums/enum';

@Injectable()
export class ItemService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly activityLogService: ActivityLogService,
    private readonly commonFileService: CommonFileService,
  ) {}

  @InjectRepository(ItemEntity)
  private itemRepo: Repository<ItemEntity>;

  @InjectRepository(ItemImageEntity)
  private itemImageRepo: Repository<ItemImageEntity>;

  async startInsertItem(req, params, newFiles: any[]) {
    const response = await this.insertItem(req, params, newFiles);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async insertItem(req, params, newFiles: any[]) {
    let return_data: any = {};
    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      } else if (!params.companyId) {
        throw new Error('companyId is required');
      }

      if (params.itemCode) {
        const itemCodeExists = await this.itemRepo.findOne({
          where: {
            itemCode: params.itemCode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });
        if (itemCodeExists) throw new Error('Item Code already exists');
      }

      if (params.barcode) {
        const barcodeExists = await this.itemRepo.findOne({
          where: {
            barcode: params.barcode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });
        if (barcodeExists) throw new Error('Barcode already exists');
      }

      if (params.referenceCode) {
        const referenceCodeExists = await this.itemRepo.findOne({
          where: {
            referenceCode: params.referenceCode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });
        if (referenceCodeExists) throw new Error('Reference Code already exists');
      }

      const { primaryImageIndex, ...dbInsertData } = params as any;

      Object.keys(dbInsertData).forEach((key) => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null || dbInsertData[key] === '') {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.itemRepo.insert(dbInsertData);
      const insertId = res?.raw?.insertId;

      if (insertId && newFiles && newFiles.length > 0) {
        const fileNames = newFiles.map((file) => file.filename);
        await this.commonFileService.transferFile(fileNames, insertId, 'item');
        
        const primaryIdx = Number(primaryImageIndex) || 0;

        const imageInserts = newFiles.map((file, index) => {
          return {
            itemId: insertId,
            fileName: file.filename,
            url: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            isPrimary: index === primaryIdx ? YesNo.Yes : YesNo.No,
            addedBy: req.user?.sub,
            addedDate: () => 'NOW()',
          };
        });
        await this.itemImageRepo.insert(imageInserts);
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'ITEM_CREATE',
        'ITEM',
        insertId,
        params.itemName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Item Added Successfully.',
        data: { insert_id: insertId },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async startUpdateItem(req, params, newFiles: any[]) {
    const response = await this.updateItem(req, params, newFiles);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async updateItem(req, params, newFiles: any[]) {
    let return_data: any = {};
    try {
      if (!params.id) throw new Error('Item ID is required');

      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      }

      const item = await this.itemRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!item) throw new Error('Item not found');

      this.general.assertCompanyAccess(req, item.companyId, 'update', 'item');

      if (params.itemCode && params.itemCode !== item.itemCode) {
        const codeExists = await this.itemRepo.findOne({
          where: { itemCode: params.itemCode, companyId: item.companyId, sysRecDeleted: false },
        });
        if (codeExists) throw new Error('Item Code already exists');
      }

      if (params.barcode && params.barcode !== item.barcode) {
        const barcodeExists = await this.itemRepo.findOne({
          where: { barcode: params.barcode, companyId: item.companyId, sysRecDeleted: false },
        });
        if (barcodeExists) throw new Error('Barcode already exists');
      }

      if (params.referenceCode && params.referenceCode !== item.referenceCode) {
        const referenceExists = await this.itemRepo.findOne({
          where: { referenceCode: params.referenceCode, companyId: item.companyId, sysRecDeleted: false },
        });
        if (referenceExists) throw new Error('Reference Code already exists');
      }

      let existingImages: any[] = [];
      if (params.existingImages) {
        try {
          existingImages = JSON.parse(params.existingImages);
        } catch (e) {
        }
      }

      const {
        id: _extractedId,
        existingImages: _extractedExistingImages,
        primaryImageIndex: _extractedPrimaryImageIndex,
        ...dbUpdateData
      } = params as any;

      Object.keys(dbUpdateData).forEach((key) => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null || dbUpdateData[key] === '') {
          dbUpdateData[key] = null;
        }
      });

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.itemRepo.update({ id: params.id }, dbUpdateData);

      const dbImages = await this.itemImageRepo.find({ where: { itemId: params.id } });
      await this.itemImageRepo.delete({ itemId: params.id });

      const existingFileNames = new Set(existingImages.map((img: any) => img.fileName));
      for (const dbImg of dbImages) {
        if (!existingFileNames.has(dbImg.fileName)) {
          await this.commonFileService.deleteFile('item', `${params.id}`, dbImg.fileName);
        }
      }

      let imageInserts: any[] = [];
      let currentPrimaryIsSet = false;

      for (const exImg of existingImages) {
        const isPrim = exImg.isPrimary === YesNo.Yes;
        if (isPrim) currentPrimaryIsSet = true;
        imageInserts.push({
          itemId: params.id,
          fileName: exImg.fileName, 
          url: exImg.fileName,
          mimeType: exImg.mimeType,
          size: exImg.size,
          isPrimary: exImg.isPrimary,
          addedBy: req.user?.sub,
          addedDate: () => 'NOW()',
        });
      }

      if (newFiles && newFiles.length > 0) {
        const fileNames = newFiles.map((file) => file.filename);
        await this.commonFileService.transferFile(fileNames, params.id, 'item');
        
        const primaryIdx = Number(params.primaryImageIndex) || -1;

        newFiles.forEach((file, index) => {
          let isPrim = YesNo.No;
          if (index === primaryIdx) {
            isPrim = YesNo.Yes;
            currentPrimaryIsSet = true;
          }
          imageInserts.push({
            itemId: params.id,
            fileName: file.filename,
            url: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            isPrimary: isPrim,
            addedBy: req.user?.sub,
            addedDate: () => 'NOW()',
          });
        });
      }

      if (imageInserts.length > 0) {
        if (!currentPrimaryIsSet) {
          imageInserts[0].isPrimary = YesNo.Yes;
        } else {
            let foundPrimary = false;
            imageInserts = imageInserts.map(img => {
                if (img.isPrimary === YesNo.Yes) {
                    if (foundPrimary) {
                        return { ...img, isPrimary: YesNo.No };
                    }
                    foundPrimary = true;
                }
                return img;
            });
        }
        await this.itemImageRepo.insert(imageInserts);
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'ITEM_UPDATE',
        'ITEM',
        params.id,
        params.itemName || item.itemName,
        item.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Item Updated Successfully.',
        data: { affected: res.affected },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async startDeleteItem(req, params) {
    const response = await this.deleteItem(req, params);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async deleteItem(req, params) {
    let return_data: any = {};
    try {
      if (!params.id) throw new Error('Item ID is required');

      const item = await this.itemRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!item) throw new Error('Item not found');

      this.general.assertCompanyAccess(req, item.companyId, 'delete', 'item');

      const payload = this.general.buildSoftDeletePayload(
        { itemCode: item.itemCode, itemName: item.itemName },
        req,
      );

      const res = await this.itemRepo.update({ id: params.id }, payload);
      
      const imgPayload = this.general.buildSoftDeletePayload({}, req);
      await this.itemImageRepo.update({ itemId: params.id, sysRecDeleted: false }, imgPayload);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'ITEM_DELETE',
        'ITEM',
        params.id,
        item.itemName,
        item.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Item Deleted Successfully.',
        data: { affected: res.affected },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async finishSuccess(params, incomingData?) {
    let output: any = {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data ? params.data : [],
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
  }

  async finishFailure(params: any, incomingData?: any) {
    let output: any = {
      settings: {
        success: params?.success || 0,
        message: params?.message || 'Something went wrong',
        data: params?.data ? params.data : [],
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
  }
}
