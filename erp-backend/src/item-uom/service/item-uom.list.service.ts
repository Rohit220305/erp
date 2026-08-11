import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ItemUomEntity } from '../entity/item-uom.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class ItemUomListService {
  constructor(private readonly general: GeneralUtilities) { }

  @InjectRepository(ItemUomEntity)
  private itemUomRepo: Repository<ItemUomEntity>;

  async startItemUomDetails(req, params) {
    const response = await this.getItemUomDetails(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getItemUomDetails(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Item UOM ID is required');
      }

      const queryBuilder = this.itemUomRepo.createQueryBuilder('uom');

      queryBuilder.select([
        'uom.id AS id',
        'uom.isoCode AS isoCode',
        'uom.itemUomCode AS itemUomCode',
        'uom.uomName AS uomName',
        'uom.abbreviation AS abbreviation',
        'uom.unitType AS unitType',
        'uom.status AS status',
        'uom.companyId AS companyId',
        'uom.addedDate AS addedDate',
        'uom.updatedDate AS updatedDate',
        'uom.addedBy AS addedBy',
        'uom.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('uom.company', 'company');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = uom.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = uom.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('uom.id = :id', { id: params.id });
      queryBuilder.andWhere('uom.sysRecDeleted = 0');

      const uom = await queryBuilder.getRawOne();

      if (!uom) {
        throw new Error('Item UOM not found');
      }

      this.general.assertCompanyAccess(req, uom.companyId, 'view', 'uom');

      uom.addedDateFormatted = await this.general.dateFormat(
        uom.addedDate,
      );

      if (uom.updatedDate) {
        uom.updatedDateFormatted = await this.general.dateFormat(
          uom.updatedDate,
        );
      }

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: uom,
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

  async startItemUomList(req, params) {
    const response = await this.getItemUomList(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getItemUomList(req, params) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.itemUomRepo.createQueryBuilder('uom');

      queryBuilder.select([
        'uom.id AS id',
        'uom.isoCode AS isoCode',
        'uom.itemUomCode AS itemUomCode',
        'uom.uomName AS uomName',
        'uom.abbreviation AS abbreviation',
        'uom.unitType AS unitType',
        'uom.status AS status',
        'uom.companyId AS companyId',
        'uom.addedDate AS addedDate',
        'uom.updatedDate AS updatedDate',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('uom.company', 'company');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = uom.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = uom.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('uom.sysRecDeleted = 0');

      this.general.applyCompanyScope(queryBuilder, req, 'uom');

      await this.general.applyListQuery(queryBuilder, params, 'uom.uomName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Item UOM List fetched successfully',
        data: {
          list: data,
          pagination,
        },
      };
    } catch (err) {
      return_data = {
        success: 0,
        message: err.message,
      };
    }

    return return_data;
  }

  async finishSuccess(params) {
    const output: any = {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data ? params?.data : [],
      },
    };

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
