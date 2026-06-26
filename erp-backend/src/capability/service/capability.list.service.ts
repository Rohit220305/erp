import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CapabilityEntity } from '../entity/capability.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class CapabilityListService {
  constructor(private readonly general: GeneralUtilities) {}

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

      const capability = await this.capabilityRepo.findOne({
        where: { id: params.id },
      });

      if (!capability) {
        throw new Error('Capability not found');
      }

      capability['addedDateFormatted'] = await this.general.dateFormat(
        capability.addedDate,
      );

      if (capability.updatedDate) {
        capability['updatedDateFormatted'] = await this.general.dateFormat(
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
      const page = params.page ? parseInt(params.page) : 1;
      const limit = params.limit ? parseInt(params.limit) : 10;
      const skip = (page - 1) * limit;

      const queryBuilder = this.capabilityRepo.createQueryBuilder('capabilities');

      if (params?.search) {
        queryBuilder.andWhere(
          `
          (
            capabilities.capabilityCode LIKE :search
            OR capabilities.capabilityName LIKE :search
            OR capabilities.moduleName LIKE :search
            OR capabilities.actionName LIKE :search
            OR capabilities.description LIKE :search  
          )
          `,
          {
            search: `%${params.search}%`,
          },
        );
      }

      if (params?.filters) {
        const whereString = await this.general.makeFilterString(
          params.filters,
          'capabilities',
        );
        if (whereString) {
          queryBuilder.andWhere(whereString);
        }
      }

      queryBuilder.orderBy('capabilities.id', 'ASC');
      queryBuilder.skip(skip);
      queryBuilder.take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      for (const cap of data) {
        cap['addedDateFormatted'] = await this.general.dateFormat(
          cap.addedDate,
        );
        if (cap.updatedDate) {
          cap['updatedDateFormatted'] = await this.general.dateFormat(
            cap.updatedDate,
          );
        }
      }

      return_data = {
        success: 1,
        message: 'Capability List fetched successfully',
        data: {
          list: data,
          pagination: {
            total,
            page,
            limit,
            total_pages: Math.ceil(total / limit),
            prevPage: page > 1,
            nextPage: total > skip + limit,
          },
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

  async finishFailure(params) {
    return params;
  }
}
