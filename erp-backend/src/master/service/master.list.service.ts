import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, SelectQueryBuilder } from 'typeorm';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { MasterConfigService } from './master-config.service';
import { MasterModuleConfig } from '../interfaces/master-module.interface';

@Injectable()
export class MasterListService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly masterConfigService: MasterConfigService,
    private readonly general: GeneralUtilities,
  ) {}

  private buildBaseQuery(config: MasterModuleConfig): SelectQueryBuilder<any> {
    const qb = this.entityManager
      .createQueryBuilder()
      .from(config.tableName, config.tableAlias);

    const selects: string[] = [
      `${config.tableAlias}.id AS id`,
      `${config.tableAlias}.status AS status`,
      `${config.tableAlias}.companyId AS companyId`,
      `${config.tableAlias}.addedDate AS addedDate`,
      `${config.tableAlias}.updatedDate AS updatedDate`,
      `${config.tableAlias}.addedBy AS addedBy`,
      `${config.tableAlias}.updatedBy AS updatedBy`,
    ];

    for (const fieldName of Object.keys(config.fields)) {
      selects.push(`${config.tableAlias}.${fieldName} AS ${fieldName}`);
    }

    qb.select(selects);

    qb.addSelect('company.companyName', 'companyName');
    qb.leftJoin('company', 'company', `company.id = ${config.tableAlias}.companyId`);

    qb.leftJoin('users', 'addedByUser', `addedByUser.id = ${config.tableAlias}.addedBy`);
    qb.leftJoin('users', 'updatedByUser', `updatedByUser.id = ${config.tableAlias}.updatedBy`);
    qb.addSelect(
      "CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)",
      'addedByName',
    );
    qb.addSelect(
      "CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)",
      'updatedByName',
    );

    if (config.joins && config.joins.length > 0) {
      for (const j of config.joins) {
        qb.leftJoin(j.table, j.alias, j.on);
        if (j.select) {
          for (const [aliasField, colExpr] of Object.entries(j.select)) {
            qb.addSelect(colExpr, aliasField);
          }
        }
      }
    }

    return qb;
  }

  async startGetDetails(module: string, req: IAppRequest, params: any) {
    const response = await this.getDetails(module, req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getDetails(module: string, req: IAppRequest, params: any) {
    let return_data: any = {};

    try {
      const id = params?.id ? Number(params.id) : null;
      if (!id) {
        throw new BadRequestException('ID is required');
      }

      const config = this.masterConfigService.getConfig(module);
      const queryBuilder = this.buildBaseQuery(config);

      queryBuilder.where(`${config.tableAlias}.id = :id`, { id });
      queryBuilder.andWhere(`${config.tableAlias}.sysRecDeleted = 0`);

      const record = await queryBuilder.getRawOne();
      if (!record) {
        throw new NotFoundException(`${config.label} not found`);
      }

      this.general.assertCompanyAccess(req, record.companyId, 'view', config.label);
      if (!this.general.isSuperAdmin(req) && record.companyId !== req.user?.companyId) {
        throw new ForbiddenException(`Cannot view ${config.label} outside your company.`);
      }

      await this.general.formatDate([record]);

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: record,
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

  async startGetList(module: string, req: IAppRequest, params: any) {
    const response = await this.getList(module, req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getList(module: string, req: IAppRequest, params: any) {
    let return_data: any = {};

    try {
      const config = this.masterConfigService.getConfig(module);
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.buildBaseQuery(config);

      queryBuilder.andWhere(`${config.tableAlias}.sysRecDeleted = 0`);

      this.general.applyCompanyScope(queryBuilder, req, config.tableAlias);

      await this.general.applyListQuery(queryBuilder, params, config.defaultSort);

      const countQb = queryBuilder.clone();
      const countRes = await countQb
        .select(`COUNT(DISTINCT ${config.tableAlias}.id)`, 'total')
        .offset(undefined)
        .limit(undefined)
        .orderBy()
        .getRawOne();
      const total = countRes ? Number(countRes.total) : 0;

      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: `${config.label} List fetched successfully`,
        data: {
          list: data,
          pagination,
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

  async finishSuccess(params: any) {
    return {
      settings: {
        success: params?.success ?? 1,
        message: params?.message || 'Success',
        data: params?.data ? params.data : [],
      },
    };
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
