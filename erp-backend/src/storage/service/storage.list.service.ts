import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StorageEntity } from '../entity/storage.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class StorageListService {
  constructor(private readonly general: GeneralUtilities) {}

  @InjectRepository(StorageEntity)
  private storageRepo: Repository<StorageEntity>;

  async startStorageDetails(req, params) {
    const response = await this.getStorageDetails(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getStorageDetails(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Storage ID is required');
      }

      const queryBuilder = this.storageRepo.createQueryBuilder('storage');

      queryBuilder.select([
        'storage.id AS id',
        'storage.storageCode AS storageCode',
        'storage.storageName AS storageName',
        'storage.status AS status',
        'storage.companyId AS companyId',
        'storage.addedDate AS addedDate',
        'storage.updatedDate AS updatedDate',
        'storage.storageImage AS storageImage',
        'storage.addedBy AS addedBy',
        'storage.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('storage.company', 'company');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = storage.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = storage.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('storage.id = :id', { id: params.id });
      queryBuilder.andWhere('storage.sysRecDeleted = 0');

      const storage = await queryBuilder.getRawOne();

      if (!storage) {
        throw new Error('Storage not found');
      }

      this.general.assertCompanyAccess(req, storage.companyId, 'view', 'storage');

      storage.addedDateFormatted = await this.general.dateFormat(
        storage.addedDate,
      );

      if (storage.updatedDate) {
        storage.updatedDateFormatted = await this.general.dateFormat(
          storage.updatedDate,
        );
      }

      if (storage.storageImage) {
        storage.imageUrl = await this.general.generateUrl(
          'storage',
          `${storage.id}`,
          storage.storageImage,
        );
      }

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: storage,
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

  async startStorageList(req, params) {
    const response = await this.getStorageList(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getStorageList(req, params) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.storageRepo.createQueryBuilder('storage');

      queryBuilder.select([
        'storage.id AS id',
        'storage.storageCode AS storageCode',
        'storage.storageName AS storageName',
        'storage.status AS status',
        'storage.companyId AS companyId',
        'storage.addedDate AS addedDate',
        'storage.updatedDate AS updatedDate',
        'storage.storageImage AS storageImage',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('storage.company', 'company');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = storage.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = storage.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('storage.sysRecDeleted = 0');

      this.general.applyCompanyScope(queryBuilder, req, 'storage');

      await this.general.applyListQuery(queryBuilder, params, 'storage.storageName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      for (const storage of data) {
        if (storage.storageImage) {
          storage.imageUrl = await this.general.generateUrl(
            'storage',
            `${storage.id}`,
            storage.storageImage,
          );
        }
      }

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Storage List fetched successfully',
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
