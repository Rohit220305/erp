import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WorkCentreEntity } from '../entity/work-centre.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class WorkCentreListService {
  constructor(private readonly general: GeneralUtilities) {}

  @InjectRepository(WorkCentreEntity)
  private workCentreRepo: Repository<WorkCentreEntity>;

  async startWorkCentreDetails(req, params) {
    const response = await this.getWorkCentreDetails(req, params);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getWorkCentreDetails(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Work Centre ID is required');
      }

      const queryBuilder = this.workCentreRepo.createQueryBuilder('workCentre');

      queryBuilder.select([
        'workCentre.id AS id',
        'workCentre.workCentreCode AS workCentreCode',
        'workCentre.workCentreName AS workCentreName',
        'workCentre.imageUrl AS imageUrl',
        'workCentre.categoryId AS categoryId',
        'workCentre.usageStatus AS usageStatus',
        'workCentre.status AS status',
        'workCentre.companyId AS companyId',
        'workCentre.addedDate AS addedDate',
        'workCentre.updatedDate AS updatedDate',
        'workCentre.addedBy AS addedBy',
        'workCentre.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = workCentre.companyId');

      queryBuilder.addSelect('category.categoryName', 'categoryName');
      queryBuilder.leftJoin('work_centre_category', 'category', 'category.id = workCentre.categoryId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = workCentre.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = workCentre.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('workCentre.id = :id', { id: params.id });
      queryBuilder.andWhere('workCentre.sysRecDeleted = 0');

      const workCentre = await queryBuilder.getRawOne();

      if (!workCentre) {
        throw new Error('Work Centre not found');
      }

      this.general.assertCompanyAccess(req, workCentre.companyId, 'view', 'work_centre');

      workCentre.addedDateFormatted = await this.general.dateFormat(workCentre.addedDate);
      if (workCentre.updatedDate) {
        workCentre.updatedDateFormatted = await this.general.dateFormat(workCentre.updatedDate);
      }

      if (workCentre.imageUrl) {
        workCentre.imageUrl = await this.general.generateUrl(
          'work_centre',
          `${workCentre.id}`,
          workCentre.imageUrl,
        );
      }

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: workCentre,
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async startWorkCentreList(req, params) {
    const response = await this.getWorkCentreList(req, params);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getWorkCentreList(req, params) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.workCentreRepo.createQueryBuilder('workCentre');

      queryBuilder.select([
        'workCentre.id AS id',
        'workCentre.workCentreCode AS workCentreCode',
        'workCentre.workCentreName AS workCentreName',
        'workCentre.imageUrl AS imageUrl',
        'workCentre.categoryId AS categoryId',
        'workCentre.usageStatus AS usageStatus',
        'workCentre.status AS status',
        'workCentre.companyId AS companyId',
        'workCentre.addedDate AS addedDate',
        'workCentre.updatedDate AS updatedDate',
        'workCentre.addedBy AS addedBy',
        'workCentre.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = workCentre.companyId');

      queryBuilder.addSelect('category.categoryName', 'categoryName');
      queryBuilder.leftJoin('work_centre_category', 'category', 'category.id = workCentre.categoryId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = workCentre.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = workCentre.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('workCentre.sysRecDeleted = 0');

      this.general.applyCompanyScope(queryBuilder, req, 'workCentre');

      await this.general.applyListQuery(queryBuilder, params, 'workCentre.workCentreName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      for (const item of data) {
        if (item.imageUrl) {
          item.imageUrl = await this.general.generateUrl(
            'work_centre',
            `${item.id}`,
            item.imageUrl,
          );
        }
      }

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Work Centre List fetched successfully',
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
