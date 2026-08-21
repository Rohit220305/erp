import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { ItemCategoryEntity } from '../entity/item-category.entity';
import { ItemCategoryStorageMappingEntity } from '../entity/item-category-storage.entity';
import { StorageEntity } from 'src/storage/entity/storage.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';
import { Status } from 'src/package/common/enums/enum';

@Injectable()
export class ItemCategoryService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @InjectRepository(ItemCategoryEntity)
  private itemCategoryRepo: Repository<ItemCategoryEntity>;

  @InjectRepository(ItemCategoryStorageMappingEntity)
  private itemCategoryStorageMappingRepo: Repository<ItemCategoryStorageMappingEntity>;

  @InjectRepository(StorageEntity)
  private storageRepo: Repository<StorageEntity>;

  async validateParentCategory(
    parentId: number,
    currentId: number | null,
    companyId: number,
  ) {
    if (currentId && parentId === Number(currentId)) {
      throw new Error(
        'Parent Category cannot be the same as the Category itself',
      );
    }

    const parentCategory = await this.itemCategoryRepo.findOne({
      where: {
        id: parentId,
        sysRecDeleted: false,
      },
    });

    if (!parentCategory) {
      throw new Error('Parent Category not found');
    }

    if (parentCategory.companyId !== companyId) {
      throw new Error('Parent Category does not belong to the same company');
    }

    if (currentId) {
      let currParentId: number | null = parentCategory.parentId;
      const visited = new Set<number>([parentId]);

      while (currParentId) {
        if (currParentId === Number(currentId)) {
          throw new Error(
            'Invalid parent category: cyclic relationship detected',
          );
        }
        if (visited.has(currParentId)) {
          break;
        }
        visited.add(currParentId);

        const nextParent = await this.itemCategoryRepo.findOne({
          where: { id: currParentId, sysRecDeleted: false },
        });
        currParentId = nextParent ? nextParent.parentId : null;
      }
    }
  }

  async validateStorageIds(storageIds: number[], companyId: number) {
    if (!storageIds || storageIds.length === 0) return;

    const foundStorages = await this.storageRepo.find({
      where: {
        id: In(storageIds),
        companyId: companyId,
        status: Status.Active,
        sysRecDeleted: false,
      },
    });

    if (foundStorages.length !== storageIds.length) {
      const foundIds = foundStorages.map((s) => s.id);
      const missingId = storageIds.find((id) => !foundIds.includes(id));
      throw new Error(
        `One or more selected storages are invalid or belong to another company (ID: ${missingId})`,
      );
    }
  }

  async startInsertItemCategory(req, params) {
    const response = await this.insertItemCategory(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response, params);
    }

    return await this.finishFailure(response);
  }

  async insertItemCategory(req, params) {
    let return_data: any = {};

    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      } else if (!params.companyId) {
        throw new Error('companyId is required');
      }

      const storageIds: number[] = params.storageIds || [];

      if (params.categoryCode) {
        const codeExists = await this.itemCategoryRepo.findOne({
          where: {
            categoryCode: params.categoryCode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Category Code already exists');
        }
      }

      if (params.categoryName) {
        const nameExists = await this.itemCategoryRepo.findOne({
          where: {
            categoryName: params.categoryName,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('Category Name already exists');
        }
      }

      if (params.parentId && params.parentId > 0) {
        await this.validateParentCategory(
          params.parentId,
          null,
          params.companyId,
        );
      }

      if (storageIds.length > 0) {
        await this.validateStorageIds(storageIds, params.companyId);
      }

      const { storageIds: _extractedStorageIds, ...dbInsertData } =
        params as any;

      Object.keys(dbInsertData).forEach((key) => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.itemCategoryRepo.insert(dbInsertData);
      const insertId = res?.raw?.insertId;

      if (insertId && storageIds.length > 0) {
        const mappingsToInsert = storageIds.map((storageId) => ({
          categoryId: insertId,
          storageId,
        }));
        await this.itemCategoryStorageMappingRepo.insert(mappingsToInsert);
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'ITEM_CATEGORY_CREATE',
        'ITEM_CATEGORY',
        insertId,
        params.categoryName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Item Category Added Successfully.',
        data: {
          insert_id: insertId,
        },
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

  async startUpdateItemCategory(req, params) {
    const response = await this.updateItemCategory(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async updateItemCategory(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Category ID is required');
      }

      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      }

      const category = await this.itemCategoryRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!category) {
        throw new Error('Item Category not found');
      }

      this.general.assertCompanyAccess(
        req,
        category.companyId,
        'update',
        'category',
      );

      const storageIds: number[] | undefined = params.storageIds;

      if (
        params.categoryCode &&
        params.categoryCode !== category.categoryCode
      ) {
        const codeExists = await this.itemCategoryRepo.findOne({
          where: {
            categoryCode: params.categoryCode,
            companyId: category.companyId,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Category Code already exists');
        }
      }

      if (
        params.categoryName &&
        params.categoryName !== category.categoryName
      ) {
        const nameExists = await this.itemCategoryRepo.findOne({
          where: {
            categoryName: params.categoryName,
            companyId: category.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('Category Name already exists');
        }
      }

      if (params.parentId && params.parentId > 0) {
        await this.validateParentCategory(
          params.parentId,
          params.id,
          category.companyId,
        );
      }

      if (storageIds && storageIds.length > 0) {
        await this.validateStorageIds(storageIds, category.companyId);
      }

      const {
        id: _extractedId,
        storageIds: _extractedStorageIds,
        ...dbUpdateData
      } = params as any;

      Object.keys(dbUpdateData).forEach((key) => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.itemCategoryRepo.update(
        { id: params.id },
        dbUpdateData,
      );

      if (storageIds !== undefined) {
        await this.itemCategoryStorageMappingRepo.delete({
          categoryId: params.id,
        });
        if (storageIds.length > 0) {
          const mappingsToInsert = storageIds.map((storageId) => ({
            categoryId: params.id,
            storageId,
          }));
          await this.itemCategoryStorageMappingRepo.insert(mappingsToInsert);
        }
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'ITEM_CATEGORY_UPDATE',
        'ITEM_CATEGORY',
        params.id,
        params.categoryName || category.categoryName,
        category.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Item Category Updated Successfully.',
        data: {
          affected: res.affected,
        },
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

  async startDeleteItemCategory(req, params) {
    const response = await this.deleteItemCategory(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deleteItemCategory(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Category ID is required');
      }

      const category = await this.itemCategoryRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!category) {
        throw new Error('Item Category not found');
      }

      this.general.assertCompanyAccess(
        req,
        category.companyId,
        'delete',
        'category',
      );

      const childCategories = await this.itemCategoryRepo.count({
        where: {
          parentId: params.id,
          sysRecDeleted: false,
        },
      });

      if (childCategories > 0) {
        throw new Error('Child categories exist. Cannot delete category.');
      }

      const payload = this.general.buildSoftDeletePayload(
        {
          categoryCode: category.categoryCode,
          categoryName: category.categoryName,
        },
        req,
      );
      const res = await this.itemCategoryRepo.update(
        { id: params.id },
        payload,
      );

      await this.itemCategoryStorageMappingRepo.delete({
        categoryId: params.id,
      });

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'ITEM_CATEGORY_DELETE',
        'ITEM_CATEGORY',
        params.id,
        category.categoryName,
        category.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Item Category Deleted Successfully.',
        data: {
          affected: res.affected,
        },
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

  async finishSuccess(params, incomingData?) {
    let output: any = {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data ? params.data : [],
      },
    };

    if (incomingData) {
      output.settings.incoming_data = incomingData;
    }

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
