import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BrandEntity } from '../entity/brand.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';

@Injectable()
export class BrandService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly commonFileService: CommonFileService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @InjectRepository(BrandEntity)
  private brandRepo: Repository<BrandEntity>;

  async startInsertBrand(req, params) {
    const response = await this.insertBrand(req, params);

    if (response.success == 1) {
      const insertId = response?.data?.insert_id;

      if (params.brandImage && insertId) {
        const fileResponse = await this.commonFileService.transferFile(
          params.brandImage,
          insertId,
          'brand',
        );

        if (fileResponse.success == 0) {
          await this.brandRepo.delete({ id: insertId });
          return await this.finishFailure({
            success: 0,
            message: 'Brand created but image transfer failed. Transaction rolled back.',
          });
        }
      }

      return await this.finishSuccess(response, params);
    }

    if (params.brandImage) {
      await this.commonFileService.deleteTempFile(params.brandImage);
    }

    return await this.finishFailure(response);
  }

  async insertBrand(req, params) {
    let return_data: any = {};

    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      } else if (!params.companyId) {
        throw new Error('companyId is required');
      }

      if (params.brandCode) {
        const codeExists = await this.brandRepo.findOne({
          where: {
            brandCode: params.brandCode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });
        
        if (codeExists) {
          throw new Error('Brand Code already exists');
        }
      }

      if (params.brandName) {
        const nameExists = await this.brandRepo.findOne({
          where: {
            brandName: params.brandName,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('Brand Name already exists');
        }
      }

      const { ...dbInsertData } = params as any;

      Object.keys(dbInsertData).forEach(key => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.brandRepo.insert(dbInsertData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'BRAND_CREATE',
        'BRAND',
        res?.raw?.insertId,
        params.brandName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Brand Added Successfully.',
        data: {
          insert_id: res?.raw?.insertId,
        },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      return_data = {
        success: 0,
        message: err.message,
      };
    }

    return return_data;
  }

  async startUpdateBrand(req, params) {
    const response = await this.updateBrand(req, params);

    if (response.success == 1) {
      if (params.brandImage && params.id) {
        const fileResponse = await this.commonFileService.transferFile(
          params.brandImage,
          params.id,
          'brand',
        );

        if (fileResponse.success == 0) {
          return await this.finishFailure({
            success: 0,
            message: 'Brand updated but image upload failed.',
          });
        }
      }

      return await this.finishSuccess(response);
    }

    if (params.brandImage) {
      await this.commonFileService.deleteTempFile(params.brandImage);
    }

    return await this.finishFailure(response);
  }

  async updateBrand(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Brand ID is required');
      }

      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      }

      const brand = await this.brandRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!brand) {
        throw new Error('Brand not found');
      }

      this.general.assertCompanyAccess(req, brand.companyId, 'update', 'brand');

      if (params.brandCode && params.brandCode !== brand.brandCode) {
        const codeExists = await this.brandRepo.findOne({
          where: { brandCode: params.brandCode, companyId: brand.companyId, sysRecDeleted: false },
        });
        if (codeExists) throw new Error('Brand Code already exists');
      }

      if (params.brandName && params.brandName !== brand.brandName) {
        const nameExists = await this.brandRepo.findOne({
          where: { brandName: params.brandName, companyId: brand.companyId, sysRecDeleted: false },
        });
        if (nameExists) throw new Error('Brand Name already exists');
      }

      const { id: _extractedId, ...dbUpdateData } = params as any;

      Object.keys(dbUpdateData).forEach(key => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.brandRepo.update({ id: params.id }, dbUpdateData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'BRAND_UPDATE',
        'BRAND',
        params.id,
        params.brandName || brand.brandName,
        brand.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Brand Updated Successfully.',
        data: { affected: res.affected },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async startDeleteBrand(req, params) {
    const response = await this.deleteBrand(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deleteBrand(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Brand ID is required');
      }

      const brand = await this.brandRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!brand) {
        throw new Error('Brand not found');
      }

      this.general.assertCompanyAccess(req, brand.companyId, 'delete', 'brand');

      const payload = this.general.buildSoftDeletePayload(
        { brandCode: brand.brandCode, brandName: brand.brandName },
        req,
      );
      const res = await this.brandRepo.update({ id: params.id }, payload);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'BRAND_DELETE',
        'BRAND',
        params.id,
        brand.brandName,
        brand.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Brand Deleted Successfully.',
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
