import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ManufacturerEntity } from '../entity/manufacturer.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class ManufacturerListService {
  constructor(private readonly general: GeneralUtilities) { }

  @InjectRepository(ManufacturerEntity)
  private manufacturerRepo: Repository<ManufacturerEntity>;

  async startManufacturerDetails(req, params) {
    const response = await this.getManufacturerDetails(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getManufacturerDetails(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Manufacturer ID is required');
      }


      const queryBuilder = this.manufacturerRepo.createQueryBuilder('manufacturer');

      queryBuilder.select([
        'manufacturer.id AS id',
        'manufacturer.manufacturerCode AS manufacturerCode',
        'manufacturer.manufacturerName AS manufacturerName',
        'manufacturer.referenceCode AS referenceCode',
        'manufacturer.status AS status',
        'manufacturer.companyId AS companyId',
        'manufacturer.addedDate AS addedDate',
        'manufacturer.updatedDate AS updatedDate',
        'manufacturer.addedBy AS addedBy',
        'manufacturer.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = manufacturer.companyId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = manufacturer.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = manufacturer.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('manufacturer.id = :id', { id: params.id });
      queryBuilder.andWhere('manufacturer.sysRecDeleted = 0');

      const manufacturer = await queryBuilder.getRawOne();

      if (!manufacturer) {
        throw new Error('Manufacturer not found');
      }
      this.general.assertCompanyAccess(req, manufacturer.companyId, 'view', 'manufacturer');

      manufacturer.addedDateFormatted = await this.general.dateFormat(
        manufacturer.addedDate,
      );

      if (manufacturer.updatedDate) {
        manufacturer.updatedDateFormatted = await this.general.dateFormat(
          manufacturer.updatedDate,
        );
      }

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: manufacturer,
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

  async startManufacturerList(req, params) {
    const response = await this.getManufacturerList(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getManufacturerList(req, params) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.manufacturerRepo.createQueryBuilder('manufacturer');

      queryBuilder.select([
        'manufacturer.id AS id',
        'manufacturer.manufacturerCode AS manufacturerCode',
        'manufacturer.manufacturerName AS manufacturerName',
        'manufacturer.referenceCode AS referenceCode',
        'manufacturer.status AS status',
        'manufacturer.companyId AS companyId',
        'manufacturer.addedDate AS addedDate',
        'manufacturer.updatedDate AS updatedDate',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = manufacturer.companyId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = manufacturer.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = manufacturer.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('manufacturer.sysRecDeleted = 0');

      this.general.applyCompanyScope(queryBuilder, req, 'manufacturer');

      await this.general.applyListQuery(queryBuilder, params, 'manufacturer.manufacturerName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Manufacturer List fetched successfully',
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
