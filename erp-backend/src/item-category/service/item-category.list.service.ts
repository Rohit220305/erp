import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ItemCategoryEntity } from '../entity/item-category.entity';
import { ItemCategoryStorageMappingEntity } from '../entity/item-category-storage.entity';
import { StorageEntity } from 'src/storage/entity/storage.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class ItemCategoryListService {
  constructor(private readonly general: GeneralUtilities) {}

  @InjectRepository(ItemCategoryEntity)
  private itemCategoryRepo: Repository<ItemCategoryEntity>;

  @InjectRepository(ItemCategoryStorageMappingEntity)
  private itemCategoryStorageMappingRepo: Repository<ItemCategoryStorageMappingEntity>;

  @InjectRepository(StorageEntity)
  private storageRepo: Repository<StorageEntity>;

  async startItemCategoryDetails(req, params) {
    const response = await this.getItemCategoryDetails(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getItemCategoryDetails(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Category ID is required');
      }

      const queryBuilder = this.itemCategoryRepo.createQueryBuilder('category');

      queryBuilder.select([
        'category.id AS id',
        'category.categoryCode AS categoryCode',
        'category.categoryName AS categoryName',
        'category.referenceCode AS referenceCode',
        'category.parentId AS parentId',
        'category.status AS status',
        'category.companyId AS companyId',
        'category.addedDate AS addedDate',
        'category.updatedDate AS updatedDate',
        'category.addedBy AS addedBy',
        'category.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = category.companyId');

      queryBuilder.addSelect('parentCategory.categoryName', 'parentCategoryName');
      queryBuilder.leftJoin('category.parentCategory', 'parentCategory');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = category.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = category.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('category.id = :id', { id: params.id });
      queryBuilder.andWhere('category.sysRecDeleted = 0');

      const category = await queryBuilder.getRawOne();

      if (!category) {
        throw new Error('Item Category not found');
      }

      this.general.assertCompanyAccess(req, category.companyId, 'view', 'category');

      const mappedStorages = await this.storageRepo.createQueryBuilder('storage')
        .select([
          'storage.id AS id',
          'storage.storageName AS storageName',
          'storage.storageCode AS storageCode',
        ])
        .innerJoin(
          ItemCategoryStorageMappingEntity,
          'mapping',
          'mapping.storageId = storage.id',
        )
        .where('mapping.categoryId = :categoryId', { categoryId: category.id })
        .andWhere('storage.sysRecDeleted = 0')
        .getRawMany();

      category.storages = mappedStorages;
      category.storageIds = mappedStorages.map((s) => s.id);
      category.storageNames = mappedStorages.map((s) => s.storageName).join(', ');

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

  async startItemCategoryList(req, params) {
    const response = await this.getItemCategoryList(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getItemCategoryList(req, params) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.itemCategoryRepo.createQueryBuilder('category');

      queryBuilder.select([
        'category.id AS id',
        'category.categoryCode AS categoryCode',
        'category.categoryName AS categoryName',
        'category.referenceCode AS referenceCode',
        'category.parentId AS parentId',
        'category.status AS status',
        'category.companyId AS companyId',
        'category.addedDate AS addedDate',
        'category.updatedDate AS updatedDate',
        'category.addedBy AS addedBy',
        'category.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = category.companyId');

      queryBuilder.addSelect('parentCategory.categoryName', 'parentCategoryName');
      queryBuilder.leftJoin('category.parentCategory', 'parentCategory');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = category.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = category.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      if (params.storageId) {
        queryBuilder.innerJoin(
          ItemCategoryStorageMappingEntity,
          'filterMapping',
          'filterMapping.categoryId = category.id AND filterMapping.storageId = :storageId',
          { storageId: params.storageId },
        );
      }

      queryBuilder.andWhere('category.sysRecDeleted = 0');

      this.general.applyCompanyScope(queryBuilder, req, 'category');

      await this.general.applyListQuery(queryBuilder, params, 'category.categoryName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      if (data.length > 0) {
        const categoryIds = data.map((item) => item.id);

        const mappedStoragesRaw = await this.storageRepo.createQueryBuilder('storage')
          .select([
            'mapping.categoryId AS categoryId',
            'storage.id AS storageId',
            'storage.storageName AS storageName',
            'storage.storageCode AS storageCode',
          ])
          .innerJoin(
            ItemCategoryStorageMappingEntity,
            'mapping',
            'mapping.storageId = storage.id',
          )
          .where('mapping.categoryId IN (:...categoryIds)', { categoryIds })
          .andWhere('storage.sysRecDeleted = 0')
          .getRawMany();

        const storageMapByCategoryId: Record<number, Array<{ id: number; storageName: string; storageCode: string }>> = {};

        mappedStoragesRaw.forEach((row) => {
          if (!storageMapByCategoryId[row.categoryId]) {
            storageMapByCategoryId[row.categoryId] = [];
          }
          storageMapByCategoryId[row.categoryId].push({
            id: row.storageId,
            storageName: row.storageName,
            storageCode: row.storageCode,
          });
        });

        data.forEach((item) => {
          const storages = storageMapByCategoryId[item.id] || [];
          item.storages = storages;
          item.storageIds = storages.map((s) => s.id);
          item.mappedStorageNames = storages.map((s) => s.storageName).join(', ');
          item.storageCount = storages.length;
        });
      }

      await this.general.formatDate(data);

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Item Category List fetched successfully',
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
