import { ManufacturerAddDto, ManufacturerUpdateDto, ManufacturerDeleteDto } from '../dto/manufacturer.dto';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ManufacturerEntity } from '../entity/manufacturer.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';

@Injectable()
export class ManufacturerService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly activityLogService: ActivityLogService,
  ) { }

  @InjectRepository(ManufacturerEntity)
  private manufacturerRepo: Repository<ManufacturerEntity>;

  async startInsertManufacturer(req, params) {
    const response = await this.insertManufacturer(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response, params);
    }

    return await this.finishFailure(response);
  }

  async insertManufacturer(req, params) {
    let return_data: any = {};

    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      } else if (!params.companyId) {
        throw new Error('companyId is required');
      }

      if (params.manufacturerCode) {
        const codeExists = await this.manufacturerRepo.findOne({
          where: {
            manufacturerCode: params.manufacturerCode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Manufacturer Code already exists');
        }
      }

      const {
        ...dbInsertData
      } = params as any;

      Object.keys(dbInsertData).forEach(key => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.manufacturerRepo.insert(dbInsertData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'MANUFACTURER_CREATE',
        'MANUFACTURER',
        res?.raw?.insertId,
        params.manufacturerName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Manufacturer Added Successfully.',
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

  async startUpdateManufacturer(req, params) {
    const response = await this.updateManufacturer(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async updateManufacturer(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Manufacturer ID is required');
      }

      const manufacturer = await this.manufacturerRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!manufacturer) {
        throw new Error('Manufacturer not found');
      }

      this.general.assertCompanyAccess(req, manufacturer.companyId, 'update', 'manufacturer');

      if (
        params.manufacturerCode &&
        params.manufacturerCode !== manufacturer.manufacturerCode
      ) {
        const codeExists = await this.manufacturerRepo.findOne({
          where: {
            manufacturerCode: params.manufacturerCode,
            companyId: manufacturer.companyId,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Manufacturer Code already exists');
        }
      }

      const {
        id: _extractedId,
        ...dbUpdateData
      } = params as any;

      Object.keys(dbUpdateData).forEach(key => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.manufacturerRepo.update(
        { id: params.id },
        dbUpdateData,
      );

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'MANUFACTURER_UPDATE',
        'MANUFACTURER',
        params.id,
        params.manufacturerName || manufacturer.manufacturerName,
        manufacturer.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Manufacturer Updated Successfully.',
        data: {
          affected: res.affected,
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

  async startDeleteManufacturer(req, params) {
    const response = await this.deleteManufacturer(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deleteManufacturer(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Manufacturer ID is required');
      }

      const manufacturer = await this.manufacturerRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!manufacturer) {
        throw new Error('Manufacturer not found');
      }

      this.general.assertCompanyAccess(req, manufacturer.companyId, 'delete', 'manufacturer');

      const payload = this.general.buildSoftDeletePayload(
        { manufacturerCode: manufacturer.manufacturerCode, manufacturerName: manufacturer.manufacturerName },
        req,
      );
      const res = await this.manufacturerRepo.update({ id: params.id }, payload);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'MANUFACTURER_DELETE',
        'MANUFACTURER',
        params.id,
        manufacturer.manufacturerName,
        manufacturer.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Manufacturer Deleted Successfully.',
        data: {
          affected: res.affected,
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

  async finishSuccess(params, incomingData?) {
    let output: any = {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data ? params.data : [],
      },
    };

    if (incomingData) {
      output.settings.incoming_data = incomingData;
    }

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

    if (incomingData) {
      output.settings.incoming_data = incomingData;
    }

    return output;
  }
}
