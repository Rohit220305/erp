import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BrandEntity } from '../entity/brand.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class BrandListService {
  constructor(private readonly general: GeneralUtilities) {}

  @InjectRepository(BrandEntity)
  private brandRepo: Repository<BrandEntity>;

  async startBrandDetails(req, params) {
    const response = await this.getBrandDetails(req, params);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getBrandDetails(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Brand ID is required');
      }

      const queryBuilder = this.brandRepo.createQueryBuilder('brand');

      queryBuilder.select([
        'brand.id AS id',
        'brand.brandCode AS brandCode',
        'brand.brandName AS brandName',
        'brand.brandImage AS brandImage',
        'brand.status AS status',
        'brand.companyId AS companyId',
        'brand.manufacturerId AS manufacturerId',
        'brand.addedDate AS addedDate',
        'brand.updatedDate AS updatedDate',
        'brand.addedBy AS addedBy',
        'brand.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = brand.companyId');

      queryBuilder.addSelect('manufacturer.manufacturerName', 'manufacturerName');
      queryBuilder.leftJoin('manufacturer_master', 'manufacturer', 'manufacturer.id = brand.manufacturerId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = brand.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = brand.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('brand.id = :id', { id: params.id });
      queryBuilder.andWhere('brand.sysRecDeleted = 0');

      const brand = await queryBuilder.getRawOne();

      if (!brand) {
        throw new Error('Brand not found');
      }

      this.general.assertCompanyAccess(req, brand.companyId, 'view', 'brand');

      brand.addedDateFormatted = await this.general.dateFormat(brand.addedDate);
      if (brand.updatedDate) {
        brand.updatedDateFormatted = await this.general.dateFormat(brand.updatedDate);
      }

      if (brand.brandImage) {
        brand.imageUrl = await this.general.generateUrl(
          'brand',
          `${brand.id}`,
          brand.brandImage,
        );
      }

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: brand,
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async startBrandList(req, params) {
    const response = await this.getBrandList(req, params);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getBrandList(req, params) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.brandRepo.createQueryBuilder('brand');

      queryBuilder.select([
        'brand.id AS id',
        'brand.brandCode AS brandCode',
        'brand.brandName AS brandName',
        'brand.brandImage AS brandImage',
        'brand.status AS status',
        'brand.companyId AS companyId',
        'brand.manufacturerId AS manufacturerId',
        'brand.addedDate AS addedDate',
        'brand.updatedDate AS updatedDate',
        'brand.addedBy AS addedBy',
        'brand.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = brand.companyId');

      queryBuilder.addSelect('manufacturer.manufacturerName', 'manufacturerName');
      queryBuilder.leftJoin('manufacturer_master', 'manufacturer', 'manufacturer.id = brand.manufacturerId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = brand.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = brand.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('brand.sysRecDeleted = 0');

      this.general.applyCompanyScope(queryBuilder, req, 'brand');

      await this.general.applyListQuery(queryBuilder, params, 'brand.brandName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      for (const item of data) {
        if (item.brandImage) {
          item.imageUrl = await this.general.generateUrl(
            'brand',
            `${item.id}`,
            item.brandImage,
          );
        }
      }

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Brand List fetched successfully',
        data: {
          list: data,
          pagination,
        },
      };
    } catch (err) {
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async finishSuccess(params) {
    return {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data ? params?.data : [],
      },
    };
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
