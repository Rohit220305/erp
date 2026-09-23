import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemEntity } from '../entity/item.entity';
import { ItemImageEntity } from '../entity/item-image.entity';
import { GeneralUtilities } from '../../package/utilities/general.utilities';
import { YesNo } from '../../package/common/enums/enum';

@Injectable()
export class ItemListService {
  constructor(private readonly general: GeneralUtilities) {}

  @InjectRepository(ItemEntity)
  private itemRepo: Repository<ItemEntity>;

  @InjectRepository(ItemImageEntity)
  private itemImageRepo: Repository<ItemImageEntity>;

  async startItemDetails(req, params) {
    const response = await this.getItemDetails(req, params);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getItemDetails(req, params) {
    let return_data: any = {};
    try {
      if (!params.id) throw new Error('Item ID is required');

      const queryBuilder = this.itemRepo.createQueryBuilder('item');

      queryBuilder.select([
        'item.id AS id',
        'item.itemName AS itemName',
        'item.shortName AS shortName',
        'item.printName AS printName',
        'item.itemCode AS itemCode',
        'item.usageType AS usageType',
        'item.categoryId AS categoryId',
        'item.companyId AS companyId',
        'item.manufacturerId AS manufacturerId',
        'item.brandId AS brandId',
        'item.inventoryType AS inventoryType',
        'item.isDecimalAllowed AS isDecimalAllowed',
        'item.packageUomId AS packageUomId',
        'item.unitsPerPacking AS unitsPerPacking',
        'item.primitiveQuantity AS primitiveQuantity',
        'item.itemUomId AS itemUomId',
        'item.referenceCode AS referenceCode',
        'item.barcode AS barcode',
        'item.vendorBarcode AS vendorBarcode',
        'item.currencyCode AS currencyCode',
        'item.purchasePrice AS purchasePrice',
        'item.costPrice AS costPrice',
        'item.costPerUnit AS costPerUnit',
        'item.weight AS weight',
        'item.weightUomId AS weightUomId',
        'item.volume AS volume',
        'item.volumeUomId AS volumeUomId',
        'item.length AS length',
        'item.width AS width',
        'item.height AS height',
        'item.dimensionUomId AS dimensionUomId',
        'item.shelfLife AS shelfLife',
        'item.shelfLifeUnit AS shelfLifeUnit',
        'item.storageId AS storageId',
        'item.batchCode AS batchCode',
        'item.isScrap AS isScrap',
        'item.description AS description',
        'item.remark AS remark',
        'item.status AS status',
        'item.isInHouseProduction AS isInHouseProduction',
        'item.addedDate AS addedDate',
        'item.updatedDate AS updatedDate',
        'item.addedBy AS addedBy',
        'item.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = item.companyId');

      queryBuilder.addSelect('category.categoryName', 'categoryName');
      queryBuilder.leftJoin('item_category_master', 'category', 'category.id = item.categoryId');

      queryBuilder.addSelect('manufacturer.manufacturerName', 'manufacturerName');
      queryBuilder.leftJoin('manufacturer_master', 'manufacturer', 'manufacturer.id = item.manufacturerId');

      queryBuilder.addSelect('brand.brandName', 'brandName');
      queryBuilder.leftJoin('brand_master', 'brand', 'brand.id = item.brandId');

      queryBuilder.addSelect('packageUom.packageName', 'packageUomName');
      queryBuilder.leftJoin('package_master', 'packageUom', 'packageUom.id = item.packageUomId');

      queryBuilder.addSelect('itemUom.uomName', 'itemUomName');
      queryBuilder.leftJoin('item_uom_master', 'itemUom', 'itemUom.id = item.itemUomId');

      queryBuilder.addSelect('weightUom.uomName', 'weightUomName');
      queryBuilder.leftJoin('item_uom_master', 'weightUom', 'weightUom.id = item.weightUomId');

      queryBuilder.addSelect('volumeUom.uomName', 'volumeUomName');
      queryBuilder.leftJoin('item_uom_master', 'volumeUom', 'volumeUom.id = item.volumeUomId');

      queryBuilder.addSelect('dimensionUom.uomName', 'dimensionUomName');
      queryBuilder.leftJoin('item_uom_master', 'dimensionUom', 'dimensionUom.id = item.dimensionUomId');

      queryBuilder.addSelect('storage.storageName', 'storageName');
      queryBuilder.leftJoin('storage_master', 'storage', 'storage.id = item.storageId');

      queryBuilder.addSelect('currency.currencyName', 'currencyName');
      queryBuilder.addSelect('currency.currencySymbol', 'currencySymbol');
      queryBuilder.leftJoin('currency_master', 'currency', 'currency.currencyCode = item.currencyCode');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = item.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = item.updatedBy');
      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.addSelect(
        "IF(item.shelfLife IS NOT NULL, CONCAT_WS(' ', item.shelfLife, item.shelfLifeUnit), NULL)",
        'shelfLifeDisplay'
      );
      queryBuilder.addSelect(
        "IF(item.primitiveQuantity IS NOT NULL, CONCAT_WS(' ', item.primitiveQuantity, itemUom.uomName), NULL)",
        'primitiveQuantityDisplay'
      );
      queryBuilder.addSelect(
        "IF(item.weight IS NOT NULL, CONCAT_WS(' ', item.weight, weightUom.uomName), NULL)",
        'weightDisplay'
      );
      queryBuilder.addSelect(
        "IF(item.volume IS NOT NULL, CONCAT_WS(' ', item.volume, volumeUom.uomName), NULL)",
        'volumeDisplay'
      );

      queryBuilder.where('item.id = :id', { id: params.id });
      queryBuilder.andWhere('item.sysRecDeleted = 0');

      const itemData = await queryBuilder.getRawOne();

      if (!itemData) throw new Error('Item not found');

      this.general.assertCompanyAccess(req, itemData.companyId, 'view', 'item');

      itemData.addedDateFormatted = await this.general.dateFormat(itemData.addedDate);
      if (itemData.updatedDate) {
        itemData.updatedDateFormatted = await this.general.dateFormat(itemData.updatedDate);
      }

      itemData.purchasePriceFormatted = this.general.formatCurrency(itemData.purchasePrice, itemData.currencySymbol);
      itemData.costPriceFormatted = this.general.formatCurrency(itemData.costPrice, itemData.currencySymbol);
      itemData.costPerUnitFormatted = this.general.formatCurrency(itemData.costPerUnit, itemData.currencySymbol);

      if (itemData.primitiveQuantity != null) {
        itemData.primitiveQuantityDisplay = this.general.formatQuantityWithUom(itemData.primitiveQuantity, itemData.itemUomName);
      }
      if (itemData.weight != null) {
        itemData.weightDisplay = this.general.formatQuantityWithUom(itemData.weight, itemData.weightUomName);
      }
      if (itemData.volume != null) {
        itemData.volumeDisplay = this.general.formatQuantityWithUom(itemData.volume, itemData.volumeUomName);
      }

      const images = await this.itemImageRepo.find({
        where: { itemId: params.id, sysRecDeleted: false },
        order: { id: 'ASC' },
      });

      itemData.images = await Promise.all(
        images.map(async (img) => {
          const url = await this.general.generateUrl('item', `${params.id}`, img.fileName);
          return {
            id: img.id,
            fileName: img.fileName,
            mimeType: img.mimeType,
            size: img.size,
            isPrimary: img.isPrimary,
            url: url,
          };
        }),
      );
      
      const primaryImg = itemData.images.find(i => i.isPrimary === 'Yes');
      itemData.primaryImageUrl = primaryImg?.url || itemData.images[0]?.url || null;

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: itemData,
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async startItemList(req, params) {
    const response = await this.getItemList(req, params);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getItemList(req, params) {
    let return_data: any = {};
    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.itemRepo.createQueryBuilder('item');

      queryBuilder.select([
        'item.id AS id',
        'item.itemName AS itemName',
        'item.shortName AS shortName',
        'item.printName AS printName',
        'item.itemCode AS itemCode',
        'item.usageType AS usageType',
        'item.categoryId AS categoryId',
        'item.companyId AS companyId',
        'item.manufacturerId AS manufacturerId',
        'item.brandId AS brandId',
        'item.inventoryType AS inventoryType',
        'item.isDecimalAllowed AS isDecimalAllowed',
        'item.packageUomId AS packageUomId',
        'item.unitsPerPacking AS unitsPerPacking',
        'item.primitiveQuantity AS primitiveQuantity',
        'item.itemUomId AS itemUomId',
        'item.referenceCode AS referenceCode',
        'item.barcode AS barcode',
        'item.vendorBarcode AS vendorBarcode',
        'item.currencyCode AS currencyCode',
        'item.purchasePrice AS purchasePrice',
        'item.costPrice AS costPrice',
        'item.costPerUnit AS costPerUnit',
        'item.weight AS weight',
        'item.weightUomId AS weightUomId',
        'item.volume AS volume',
        'item.volumeUomId AS volumeUomId',
        'item.length AS length',
        'item.width AS width',
        'item.height AS height',
        'item.dimensionUomId AS dimensionUomId',
        'item.shelfLife AS shelfLife',
        'item.shelfLifeUnit AS shelfLifeUnit',
        'item.storageId AS storageId',
        'item.batchCode AS batchCode',
        'item.isScrap AS isScrap',
        'item.description AS description',
        'item.remark AS remark',
        'item.status AS status',
        'item.isInHouseProduction AS isInHouseProduction',
        'item.addedDate AS addedDate',
        'item.updatedDate AS updatedDate',
        'item.addedBy AS addedBy',
        'item.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = item.companyId');

      queryBuilder.addSelect('category.categoryName', 'categoryName');
      queryBuilder.leftJoin('item_category_master', 'category', 'category.id = item.categoryId');

      queryBuilder.addSelect('manufacturer.manufacturerName', 'manufacturerName');
      queryBuilder.leftJoin('manufacturer_master', 'manufacturer', 'manufacturer.id = item.manufacturerId');

      queryBuilder.addSelect('brand.brandName', 'brandName');
      queryBuilder.leftJoin('brand_master', 'brand', 'brand.id = item.brandId');

      queryBuilder.addSelect('packageUom.packageName', 'packageUomName');
      queryBuilder.leftJoin('package_master', 'packageUom', 'packageUom.id = item.packageUomId');

      queryBuilder.addSelect('itemUom.uomName', 'itemUomName');
      queryBuilder.leftJoin('item_uom_master', 'itemUom', 'itemUom.id = item.itemUomId');

      queryBuilder.addSelect('weightUom.uomName', 'weightUomName');
      queryBuilder.leftJoin('item_uom_master', 'weightUom', 'weightUom.id = item.weightUomId');

      queryBuilder.addSelect('volumeUom.uomName', 'volumeUomName');
      queryBuilder.leftJoin('item_uom_master', 'volumeUom', 'volumeUom.id = item.volumeUomId');

      queryBuilder.addSelect('dimensionUom.uomName', 'dimensionUomName');
      queryBuilder.leftJoin('item_uom_master', 'dimensionUom', 'dimensionUom.id = item.dimensionUomId');

      queryBuilder.addSelect('storage.storageName', 'storageName');
      queryBuilder.leftJoin('storage_master', 'storage', 'storage.id = item.storageId');

      queryBuilder.addSelect('currency.currencyName', 'currencyName');
      queryBuilder.addSelect('currency.currencySymbol', 'currencySymbol');
      queryBuilder.leftJoin('currency_master', 'currency', 'currency.currencyCode = item.currencyCode');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = item.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = item.updatedBy');
      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.addSelect(
        "IF(item.shelfLife IS NOT NULL, CONCAT_WS(' ', item.shelfLife, item.shelfLifeUnit), NULL)",
        'shelfLifeDisplay'
      );
      queryBuilder.addSelect(
        "IF(item.primitiveQuantity IS NOT NULL, CONCAT_WS(' ', item.primitiveQuantity, itemUom.uomName), NULL)",
        'primitiveQuantityDisplay'
      );
      queryBuilder.addSelect(
        "IF(item.weight IS NOT NULL, CONCAT_WS(' ', item.weight, weightUom.uomName), NULL)",
        'weightDisplay'
      );
      queryBuilder.addSelect(
        "IF(item.volume IS NOT NULL, CONCAT_WS(' ', item.volume, volumeUom.uomName), NULL)",
        'volumeDisplay'
      );

      queryBuilder.addSelect('primaryImage.fileName', 'primaryImageFileName');
      queryBuilder.leftJoin(
        'item_images',
        'primaryImage',
        "primaryImage.itemId = item.id AND primaryImage.isPrimary = :isPrimary AND primaryImage.sysRecDeleted = 0",
        { isPrimary: YesNo.Yes }
      );

      queryBuilder.andWhere('item.sysRecDeleted = 0');

      this.general.applyCompanyScope(queryBuilder, req, 'item');

      await this.general.applyListQuery(queryBuilder, params, 'item.itemName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      for (const item of data) {
        if (item.primaryImageFileName) {
          item.primaryImageUrl = await this.general.generateUrl(
            'item',
            `${item.id}`,
            item.primaryImageFileName,
          );
        } else {
          item.primaryImageUrl = null;
        }

        item.purchasePriceFormatted = this.general.formatCurrency(item.purchasePrice, item.currencySymbol);
        item.costPriceFormatted = this.general.formatCurrency(item.costPrice, item.currencySymbol);
        item.costPerUnitFormatted = this.general.formatCurrency(item.costPerUnit, item.currencySymbol);

        if (item.primitiveQuantity != null) {
          item.primitiveQuantityDisplay = this.general.formatQuantityWithUom(item.primitiveQuantity, item.itemUomName);
        }
        if (item.weight != null) {
          item.weightDisplay = this.general.formatQuantityWithUom(item.weight, item.weightUomName);
        }
        if (item.volume != null) {
          item.volumeDisplay = this.general.formatQuantityWithUom(item.volume, item.volumeUomName);
        }
      }
      
      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Item List fetched successfully',
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
