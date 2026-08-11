import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ItemUomEntity } from '../entity/item-uom.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';

@Injectable()
export class ItemUomService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly activityLogService: ActivityLogService,
  ) { }

  @InjectRepository(ItemUomEntity)
  private itemUomRepo: Repository<ItemUomEntity>;

  async startInsertItemUom(req, params) {
    const response = await this.insertItemUom(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response, params);
    }

    return await this.finishFailure(response);
  }

  async insertItemUom(req, params) {
    let return_data: any = {};

    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      } else if (!params.companyId) {
        throw new Error('companyId is required');
      }

      if (params.isoCode) {
        const codeExists = await this.itemUomRepo.findOne({
          where: {
            isoCode: params.isoCode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('ISO Code already exists');
        }
      }

      if (params.uomName) {
        const nameExists = await this.itemUomRepo.findOne({
          where: {
            uomName: params.uomName,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('UOM Name already exists');
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

      const res = await this.itemUomRepo.insert(dbInsertData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'ITEM_UOM_CREATE',
        'ITEM_UOM',
        res?.raw?.insertId,
        params.uomName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Item UOM Added Successfully.',
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

  async startUpdateItemUom(req, params) {
    const response = await this.updateItemUom(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async updateItemUom(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Item UOM ID is required');
      }

      const uom = await this.itemUomRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!uom) {
        throw new Error('Item UOM not found');
      }

      this.general.assertCompanyAccess(req, uom.companyId, 'update', 'uom');

      if (params.isoCode && params.isoCode !== uom.isoCode) {
        const codeExists = await this.itemUomRepo.findOne({
          where: {
            isoCode: params.isoCode,
            companyId: uom.companyId,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('ISO Code already exists');
        }
      }

      if (params.uomName && params.uomName !== uom.uomName) {
        const nameExists = await this.itemUomRepo.findOne({
          where: {
            uomName: params.uomName,
            companyId: uom.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('UOM Name already exists');
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

      const res = await this.itemUomRepo.update(
        { id: params.id },
        dbUpdateData,
      );

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'ITEM_UOM_UPDATE',
        'ITEM_UOM',
        params.id,
        params.uomName || uom.uomName,
        uom.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Item UOM Updated Successfully.',
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

  async startDeleteItemUom(req, params) {
    const response = await this.deleteItemUom(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deleteItemUom(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Item UOM ID is required');
      }

      const uom = await this.itemUomRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!uom) {
        throw new Error('Item UOM not found');
      }

      this.general.assertCompanyAccess(req, uom.companyId, 'delete', 'uom');

      const payload = this.general.buildSoftDeletePayload(
        { isoCode: uom.isoCode, uomName: uom.uomName },
        req,
      );
      const res = await this.itemUomRepo.update({ id: params.id }, payload);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'ITEM_UOM_DELETE',
        'ITEM_UOM',
        params.id,
        uom.uomName,
        uom.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Item UOM Deleted Successfully.',
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
