import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PlantEntity } from '../entity/plant.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class PlantListService {
  constructor(private readonly general: GeneralUtilities) {}

  @InjectRepository(PlantEntity)
  private plantRepo: Repository<PlantEntity>;

  async startPlantDetails(req: any, params: any) {
    const response = await this.getPlantDetails(req, params);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getPlantDetails(req: any, params: any) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Plant ID is required');
      }

      const queryBuilder = this.plantRepo.createQueryBuilder('plant');

      queryBuilder.select([
        'plant.id AS id',
        'plant.companyId AS companyId',
        'plant.name AS name',
        'plant.code AS code',
        'plant.image AS image',
        'plant.remark AS remark',
        'plant.status AS status',
        'plant.addedDate AS addedDate',
        'plant.updatedDate AS updatedDate',
        'plant.addedBy AS addedBy',
        'plant.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = plant.companyId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = plant.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = plant.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('plant.id = :id', { id: params.id });
      queryBuilder.andWhere('plant.sysRecDeleted = 0');

      const plant = await queryBuilder.getRawOne();

      if (!plant) {
        throw new Error('Plant not found');
      }

      this.general.assertCompanyAccess(req, plant.companyId, 'view', 'plant');

      plant.addedDateFormatted = await this.general.dateFormat(plant.addedDate);
      if (plant.updatedDate) {
        plant.updatedDateFormatted = await this.general.dateFormat(plant.updatedDate);
      }

      if (plant.image) {
        plant.imageUrl = await this.general.generateUrl(
          'plant',
          `${plant.id}`,
          plant.image,
        );
      }

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: plant,
      };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async startPlantList(req: any, params: any) {
    const response = await this.getPlantList(req, params);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getPlantList(req: any, params: any) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.plantRepo.createQueryBuilder('plant');

      queryBuilder.select([
        'plant.id AS id',
        'plant.companyId AS companyId',
        'plant.name AS name',
        'plant.code AS code',
        'plant.image AS image',
        'plant.remark AS remark',
        'plant.status AS status',
        'plant.addedDate AS addedDate',
        'plant.updatedDate AS updatedDate',
        'plant.addedBy AS addedBy',
        'plant.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = plant.companyId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = plant.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = plant.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('plant.sysRecDeleted = 0');

      this.general.applyCompanyScope(queryBuilder, req, 'plant');

      await this.general.applyListQuery(queryBuilder, params, 'plant.name');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      for (const item of data) {
        if (item.image) {
          item.imageUrl = await this.general.generateUrl(
            'plant',
            `${item.id}`,
            item.image,
          );
        }
      }

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Plant List fetched successfully',
        data: {
          list: data,
          pagination,
        },
      };
    } catch (err: any) {
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async finishSuccess(params: any) {
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
