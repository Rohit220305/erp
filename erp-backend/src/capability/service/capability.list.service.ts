import { Injectable } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CapabilityEntity } from '../entity/capability.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class CapabilityListService {
  constructor(private readonly general: GeneralUtilities) { }

  @InjectRepository(CapabilityEntity)
  private capabilityRepo: Repository<CapabilityEntity>;

  async startCapabilityDetails(params) {
    const response = await this.getCapabilityDetails(params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getCapabilityDetails(params) {
    let return_data: any = {};
    try {
      if (!params.id) {
        throw new Error('Capability ID is required');
      }

      const queryBuilder = this.capabilityRepo.createQueryBuilder('capabilities');

      queryBuilder.select([
        'capabilities.id AS id',
        'capabilities.capabilityCode AS capabilityCode',
        'capabilities.capabilityName AS capabilityName',
        'capabilities.moduleName AS moduleName',
        'capabilities.actionName AS actionName',
        'capabilities.description AS description',
        'capabilities.status AS status',
        'capabilities.addedDate AS addedDate',
        'capabilities.updatedDate AS updatedDate',
        'capabilities.addedBy AS addedBy',
        'capabilities.updatedBy AS updatedBy',
      ]);

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = capabilities.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = capabilities.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('capabilities.id = :id', { id: params.id });
      queryBuilder.andWhere('capabilities.sysRecDeleted = 0');

      const capability = await queryBuilder.getRawOne();

      if (!capability) {
        throw new Error('Capability not found');
      }

      capability.addedDateFormatted = await this.general.dateFormat(
        capability.addedDate,
      );

      if (capability.updatedDate) {
        capability.updatedDateFormatted = await this.general.dateFormat(
          capability.updatedDate,
        );
      }

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: capability,
      };
    } catch (err) {
      return_data = {
        success: 0,
        message: err.message,
      };
    }
    return return_data;
  }

  async startCapabilityList(req, params) {
    const response = await this.getCapabilityList(params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getCapabilityList(params) {
    let return_data: any = {};
    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.capabilityRepo.createQueryBuilder('capabilities');

      queryBuilder.select([
        'capabilities.id AS id',
        'capabilities.capabilityCode AS capabilityCode',
        'capabilities.capabilityName AS capabilityName',
        'capabilities.moduleName AS moduleName',
        'capabilities.actionName AS actionName',
        'capabilities.description AS description',
        'capabilities.status AS status',
        'capabilities.addedDate AS addedDate',
        'capabilities.updatedDate AS updatedDate',
      ]);

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = capabilities.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = capabilities.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('capabilities.sysRecDeleted = 0');

      await this.general.applyListQuery(queryBuilder, params, 'capabilities.id');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Capability List fetched successfully',
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
    return {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data || [],
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

    if (incomingData) {
      output.settings.incoming_data = incomingData;
    }

    return output;
  }
}
