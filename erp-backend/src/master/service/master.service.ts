import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';
import { MasterConfigService } from './master-config.service';
import { MasterValidatorService } from './master-validator.service';

@Injectable()
export class MasterService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly masterConfigService: MasterConfigService,
    private readonly masterValidatorService: MasterValidatorService,
    private readonly general: GeneralUtilities,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async startInsertMaster(module: string, req: IAppRequest, params: any) {
    const response = await this.insertMaster(module, req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response, params);
    }
    return await this.finishFailure(response);
  }

  async insertMaster(module: string, req: IAppRequest, params: any) {
    let return_data: any = {};

    try {
      const config = this.masterConfigService.getConfig(module);
      const cleanData = this.masterValidatorService.validateAndClean(params, config);

      let companyId: number;
      if (!this.general.isSuperAdmin(req)) {
        if (!req.user?.companyId) {
          throw new BadRequestException('User companyId is missing');
        }
        companyId = req.user.companyId;
      } else if (params.companyId) {
        companyId = Number(params.companyId);
      } else {
        throw new BadRequestException('companyId is required');
      }
      cleanData.companyId = companyId;

      if (config.uniqueFields && config.uniqueFields.length > 0) {
        for (const uniqueGroup of config.uniqueFields) {
          const qb = this.entityManager
            .createQueryBuilder()
            .select('count(*)', 'cnt')
            .from(config.tableName, config.tableAlias)
            .where(`${config.tableAlias}.companyId = :companyId`, { companyId })
            .andWhere(`${config.tableAlias}.sysRecDeleted = 0`);

          let hasValue = false;
          uniqueGroup.forEach((field, idx) => {
            if (cleanData[field] !== undefined && cleanData[field] !== null) {
              qb.andWhere(`${config.tableAlias}.${field} = :val_${idx}`, {
                [`val_${idx}`]: cleanData[field],
              });
              hasValue = true;
            }
          });

          if (hasValue) {
            const countRes = await qb.getRawOne();
            const count = countRes ? Number(countRes.cnt) : 0;
            if (count > 0) {
              const label = uniqueGroup.join(' and ');
              throw new BadRequestException(`${config.label} with this ${label} already exists.`);
            }
          }
        }
      }

      if (config.fkRefs && config.fkRefs.length > 0) {
        for (const fk of config.fkRefs) {
          const fkVal = cleanData[fk.field];
          if (fkVal !== undefined && fkVal !== null && fkVal !== '') {
            const qb = this.entityManager
              .createQueryBuilder()
              .select('id')
              .from(fk.refTable, 'ref')
              .where('ref.id = :fkVal', { fkVal })
              .andWhere('ref.sysRecDeleted = 0');

            if (fk.crossTenant) {
              qb.andWhere('ref.companyId = :companyId', { companyId });
            }

            const exists = await qb.getRawOne();
            if (!exists) {
              throw new BadRequestException(
                `Referenced ${fk.refLabelField || fk.field} does not exist.`,
              );
            }
          }
        }
      }

      cleanData.addedBy = req.user?.sub;
      cleanData.addedDate = () => 'NOW()';
      cleanData.status = cleanData.status || 'Active';

      const res = await this.entityManager
        .createQueryBuilder()
        .insert()
        .into(config.tableName)
        .values(cleanData)
        .execute();

      const insertId = res?.raw?.insertId;

      const displayVal = cleanData[config.nameField] || `${config.label} #${insertId}`;
      const logPayload = this.general.buildActivityLogPayload(
        req,
        `${module.toUpperCase()}_CREATE`,
        module.toUpperCase(),
        insertId,
        displayVal,
        companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: `${config.label} Added Successfully.`,
        data: {
          insert_id: insertId,
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

  async startUpdateMaster(module: string, req: IAppRequest, params: any) {
    const response = await this.updateMaster(module, req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async updateMaster(module: string, req: IAppRequest, params: any) {
    let return_data: any = {};

    try {
      const id = params?.id ? Number(params.id) : null;
      if (!id) {
        throw new BadRequestException('ID is required');
      }

      const config = this.masterConfigService.getConfig(module);

      const existing = await this.entityManager
        .createQueryBuilder()
        .select('*')
        .from(config.tableName, config.tableAlias)
        .where(`${config.tableAlias}.id = :id`, { id })
        .andWhere(`${config.tableAlias}.sysRecDeleted = 0`)
        .getRawOne();

      if (!existing) {
        throw new NotFoundException(`${config.label} not found`);
      }

      this.general.assertCompanyAccess(req, existing.companyId, 'update', config.label);
      if (!this.general.isSuperAdmin(req) && existing.companyId !== req.user?.companyId) {
        throw new ForbiddenException(`Cannot update ${config.label} outside your company.`);
      }

      const cleanData = this.masterValidatorService.validateAndClean(params, config);

      if (config.uniqueFields && config.uniqueFields.length > 0) {
        for (const uniqueGroup of config.uniqueFields) {
          const hasChanged = uniqueGroup.some(
            (field) =>
              cleanData[field] !== undefined &&
              String(cleanData[field]) !== String(existing[field]),
          );

          if (hasChanged) {
            const qb = this.entityManager
              .createQueryBuilder()
              .select('count(*)', 'cnt')
              .from(config.tableName, config.tableAlias)
              .where(`${config.tableAlias}.companyId = :companyId`, {
                companyId: existing.companyId,
              })
              .andWhere(`${config.tableAlias}.sysRecDeleted = 0`)
              .andWhere(`${config.tableAlias}.id != :id`, { id });

            uniqueGroup.forEach((field, idx) => {
              const val = cleanData[field] !== undefined ? cleanData[field] : existing[field];
              qb.andWhere(`${config.tableAlias}.${field} = :val_${idx}`, {
                [`val_${idx}`]: val,
              });
            });

            const countRes = await qb.getRawOne();
            const count = countRes ? Number(countRes.cnt) : 0;
            if (count > 0) {
              const label = uniqueGroup.join(' and ');
              throw new BadRequestException(
                `${config.label} with this ${label} already exists.`,
              );
            }
          }
        }
      }

      if (config.fkRefs && config.fkRefs.length > 0) {
        for (const fk of config.fkRefs) {
          const fkVal = cleanData[fk.field];
          if (
            fkVal !== undefined &&
            fkVal !== null &&
            fkVal !== '' &&
            String(fkVal) !== String(existing[fk.field])
          ) {
            const qb = this.entityManager
              .createQueryBuilder()
              .select('id')
              .from(fk.refTable, 'ref')
              .where('ref.id = :fkVal', { fkVal })
              .andWhere('ref.sysRecDeleted = 0');

            if (fk.crossTenant) {
              qb.andWhere('ref.companyId = :companyId', { companyId: existing.companyId });
            }

            const exists = await qb.getRawOne();
            if (!exists) {
              throw new BadRequestException(
                `Referenced ${fk.refLabelField || fk.field} does not exist.`,
              );
            }
          }
        }
      }

      cleanData.updatedBy = req.user?.sub;
      cleanData.updatedDate = () => 'NOW()';

      const res = await this.entityManager
        .createQueryBuilder()
        .update(config.tableName)
        .set(cleanData)
        .where('id = :id', { id })
        .execute();

      const displayVal =
        cleanData[config.nameField] || existing[config.nameField] || `${config.label} #${id}`;
      const logPayload = this.general.buildActivityLogPayload(
        req,
        `${module.toUpperCase()}_UPDATE`,
        module.toUpperCase(),
        id,
        displayVal,
        existing.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: `${config.label} Updated Successfully.`,
        data: { affected: res.affected },
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

  async startDeleteMaster(module: string, req: IAppRequest, params: any) {
    const response = await this.deleteMaster(module, req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async deleteMaster(module: string, req: IAppRequest, params: any) {
    let return_data: any = {};

    try {
      const id = params?.id ? Number(params.id) : null;
      if (!id) {
        throw new BadRequestException('ID is required');
      }

      const config = this.masterConfigService.getConfig(module);

      const existing = await this.entityManager
        .createQueryBuilder()
        .select('*')
        .from(config.tableName, config.tableAlias)
        .where(`${config.tableAlias}.id = :id`, { id })
        .andWhere(`${config.tableAlias}.sysRecDeleted = 0`)
        .getRawOne();

      if (!existing) {
        throw new NotFoundException(`${config.label} not found`);
      }

      this.general.assertCompanyAccess(req, existing.companyId, 'delete', config.label);
      if (!this.general.isSuperAdmin(req) && existing.companyId !== req.user?.companyId) {
        throw new ForbiddenException(`Cannot delete ${config.label} outside your company.`);
      }

      const payload: any = {
        sysRecDeleted: 1,
        updatedBy: req.user?.sub,
        updatedDate: () => 'NOW()',
      };

      const res = await this.entityManager
        .createQueryBuilder()
        .update(config.tableName)
        .set(payload)
        .where('id = :id', { id })
        .execute();

      const displayVal = existing[config.nameField] || `${config.label} #${id}`;
      const logPayload = this.general.buildActivityLogPayload(
        req,
        `${module.toUpperCase()}_DELETE`,
        module.toUpperCase(),
        id,
        displayVal,
        existing.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: `${config.label} Deleted Successfully.`,
        data: { affected: res.affected },
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

  async finishSuccess(params: any, incomingData?: any) {
    const output: any = {
      settings: {
        success: params?.success ?? 1,
        message: params?.message || 'Success',
        data: params?.data ? params.data : [],
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
  }

  async finishFailure(params: any, incomingData?: any) {
    const output: any = {
      settings: {
        success: params?.success ?? 0,
        message: params?.message || 'Something went wrong',
        data: params?.data ? params.data : [],
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
  }
}
