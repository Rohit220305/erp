import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PlantEntity } from '../entity/plant.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';

@Injectable()
export class PlantService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly commonFileService: CommonFileService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @InjectRepository(PlantEntity)
  private plantRepo: Repository<PlantEntity>;

  async startInsertPlant(req: any, params: any) {
    const response = await this.insertPlant(req, params);

    if (response.success == 1) {
      const insertId = response?.data?.insert_id;

      if (params.image && insertId) {
        const fileResponse = await this.commonFileService.transferFile(
          params.image,
          insertId,
          'plant',
        );

        if (fileResponse.success == 0) {
          await this.plantRepo.delete({ id: insertId });
          return await this.finishFailure({
            success: 0,
            message: 'Plant created but image transfer failed. Transaction rolled back.',
          });
        }
      }

      return await this.finishSuccess(response, params);
    }

    if (params.image) {
      await this.commonFileService.deleteTempFile(params.image);
    }

    return await this.finishFailure(response);
  }

  async insertPlant(req: any, params: any) {
    let return_data: any = {};

    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      } else if (!params.companyId) {
        throw new Error('companyId is required');
      }

      if (params.code) {
        const codeExists = await this.plantRepo.findOne({
          where: {
            code: params.code,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Plant Code already exists');
        }
      }

      if (params.name) {
        const nameExists = await this.plantRepo.findOne({
          where: {
            name: params.name,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('Plant Name already exists');
        }
      }

      const { ...dbInsertData } = params as any;

      Object.keys(dbInsertData).forEach((key) => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.plantRepo.insert(dbInsertData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PLANT_CREATE',
        'PLANT',
        res?.raw?.insertId,
        params.name,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Plant Added Successfully.',
        data: {
          insert_id: res?.raw?.insertId,
        },
      };
    } catch (err: any) {
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

  async startUpdatePlant(req: any, params: any) {
    const response = await this.updatePlant(req, params);

    if (response.success == 1) {
      if (params.image && params.id) {
        const fileResponse = await this.commonFileService.transferFile(
          params.image,
          params.id,
          'plant',
        );

        if (fileResponse.success == 0) {
          return await this.finishFailure({
            success: 0,
            message: 'Plant updated but image upload failed.',
          });
        }
      }

      return await this.finishSuccess(response);
    }

    if (params.image) {
      await this.commonFileService.deleteTempFile(params.image);
    }

    return await this.finishFailure(response);
  }

  async updatePlant(req: any, params: any) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Plant ID is required');
      }

      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      }

      const plant = await this.plantRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!plant) {
        throw new Error('Plant not found');
      }

      this.general.assertCompanyAccess(req, plant.companyId, 'update', 'plant');

      if (params.code && params.code !== plant.code) {
        const codeExists = await this.plantRepo.findOne({
          where: {
            code: params.code,
            companyId: plant.companyId,
            sysRecDeleted: false,
          },
        });
        if (codeExists) throw new Error('Plant Code already exists');
      }

      if (params.name && params.name !== plant.name) {
        const nameExists = await this.plantRepo.findOne({
          where: {
            name: params.name,
            companyId: plant.companyId,
            sysRecDeleted: false,
          },
        });
        if (nameExists) throw new Error('Plant Name already exists');
      }

      const { id: _extractedId, ...dbUpdateData } = params as any;

      Object.keys(dbUpdateData).forEach((key) => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.plantRepo.update({ id: params.id }, dbUpdateData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PLANT_UPDATE',
        'PLANT',
        params.id,
        params.name || plant.name,
        plant.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Plant Updated Successfully.',
        data: { affected: res.affected },
      };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async startDeletePlant(req: any, params: any) {
    const response = await this.deletePlant(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deletePlant(req: any, params: any) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Plant ID is required');
      }

      const plant = await this.plantRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!plant) {
        throw new Error('Plant not found');
      }

      this.general.assertCompanyAccess(req, plant.companyId, 'delete', 'plant');

      const payload = this.general.buildSoftDeletePayload(
        { code: plant.code, name: plant.name },
        req,
      );
      const res = await this.plantRepo.update({ id: params.id }, payload);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PLANT_DELETE',
        'PLANT',
        params.id,
        plant.name,
        plant.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Plant Deleted Successfully.',
        data: { affected: res.affected },
      };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async finishSuccess(params: any, incomingData?: any) {
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
