import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WorkCentreCategoryEntity } from '../entity/work-centre-category.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class WorkCentreCategoryListService {
  constructor(private readonly general: GeneralUtilities) { }

  @InjectRepository(WorkCentreCategoryEntity)
  private workCentreCategoryRepo: Repository<WorkCentreCategoryEntity>;

  async startWorkCentreCategoryDetails(req, params) {
    const response = await this.getWorkCentreCategoryDetails(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getWorkCentreCategoryDetails(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Category ID is required');
      }

      const queryBuilder = this.workCentreCategoryRepo.createQueryBuilder('category');

      queryBuilder.select([
        'category.id AS id',
        'category.categoryCode AS categoryCode',
        'category.categoryName AS categoryName',
        'category.status AS status',
        'category.companyId AS companyId',
        'category.addedDate AS addedDate',
        'category.updatedDate AS updatedDate',
        'category.addedBy AS addedBy',
        'category.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('category.company', 'company');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = category.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = category.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('category.id = :id', { id: params.id });
      queryBuilder.andWhere('category.sysRecDeleted = 0');

      const category = await queryBuilder.getRawOne();

      if (!category) {
        throw new Error('Work Centre Category not found');
      }

      this.general.assertCompanyAccess(req, category.companyId, 'view', 'category');

      category.addedDateFormatted = await this.general.dateFormat(
        category.addedDate,
      );

      if (category.updatedDate) {
        category.updatedDateFormatted = await this.general.dateFormat(
          category.updatedDate,
        );
      }

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: category,
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

  async startWorkCentreCategoryList(req, params) {
    const response = await this.getWorkCentreCategoryList(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getWorkCentreCategoryList(req, params) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.workCentreCategoryRepo.createQueryBuilder('category');

      queryBuilder.select([
        'category.id AS id',
        'category.categoryCode AS categoryCode',
        'category.categoryName AS categoryName',
        'category.status AS status',
        'category.companyId AS companyId',
        'category.addedDate AS addedDate',
        'category.updatedDate AS updatedDate',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('category.company', 'company');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = category.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = category.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('category.sysRecDeleted = 0');

      this.general.applyCompanyScope(queryBuilder, req, 'category');

      await this.general.applyListQuery(queryBuilder, params, 'category.categoryName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Work Centre Category List fetched successfully',
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
