import { Injectable } from '@nestjs/common';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
export interface CategorizedBatchItems {
  rawMaterials: any[];
  semiFinished: any[];
  finishedProducts: any[];
}

@Injectable()
export class BatchItemCategorizerUtility {
  constructor(private readonly general: GeneralUtilities) { }

  categorizeBatchItems(
    items: any[],
    mainItemId?: number,
    itemImageMap?: Map<number, string | null>,
    batchData?: any,
  ): CategorizedBatchItems {
    const exitItemIds = new Set(
      (items || []).filter((i) => i.materialType === 'Exit').map((i) => Number(i.itemId)),
    );
    const entryItemIds = new Set(
      (items || []).filter((i) => i.materialType === 'Entry').map((i) => Number(i.itemId)),
    );

    const rawMaterialsMap = new Map<number, any>();
    const semiFinishedMap = new Map<number, any>();
    const finishedProductsMap = new Map<number, any>();

    const targetMainItemId = mainItemId ? Number(mainItemId) : null;

    for (const item of items || []) {
      const itemId = Number(item.itemId);
      const isEntry = item.materialType === 'Entry';
      const isExit = item.materialType === 'Exit';
      const isInternal = (isEntry && exitItemIds.has(itemId)) || (isExit && entryItemIds.has(itemId));

      const targetMap =
        targetMainItemId && itemId === targetMainItemId
          ? finishedProductsMap
          : isEntry && !isInternal
            ? rawMaterialsMap
            : isInternal
              ? semiFinishedMap
              : finishedProductsMap;

      if (!targetMap.has(itemId)) {
        targetMap.set(itemId, {
          id: item.id ? Number(item.id) : null,
          itemId,
          itemName: item.itemName,
          itemCode: item.itemCode,
          uomName: item.uomName,
          materialType: item.materialType,
          isInternalTransfer: isInternal,
          requiredQty: isInternal && item.materialType === 'Exit' ? 0 : Number(item.requiredQty || 0),
          requestedQty: Number(item.requestedQty || item.requestQty || 0),
          receivedQty: Number(item.receivedQty || 0),
          consumedQty: Number(item.consumedQty || 0),
          producedQty: Number(item.producedQty || 0),
          availableStock: Number(item.availableStock || 0),
          costPerUnit: Number(item.costPerUnit || 0),
          currencyCode: item.currencyCode || 'N/A',
          itemImageUrl: itemImageMap ? itemImageMap.get(itemId) || null : item.itemImageUrl || null,
        });
      } else {
        const existing = targetMap.get(itemId);
        if (isInternal && item.materialType === 'Exit') {
        } else {
          existing.requiredQty += Number(item.requiredQty || 0);
        }
        existing.requestedQty += Number(item.requestedQty || item.requestQty || 0);
        existing.receivedQty += Number(item.receivedQty || 0);
        existing.consumedQty += Number(item.consumedQty || 0);
        existing.producedQty += Number(item.producedQty || 0);
        existing.availableStock += Number(item.availableStock || 0);
      }
    }

    if (targetMainItemId && !finishedProductsMap.has(targetMainItemId) && batchData) {
      const batchProducedQty = Number(batchData.producedQuantity || 0);
      finishedProductsMap.set(targetMainItemId, {
        id: null,
        itemId: targetMainItemId,
        itemName: batchData.itemName,
        itemCode: batchData.itemCode,
        uomName: batchData.uomName,
        materialType: 'Exit',
        isInternalTransfer: false,
        requiredQty: Number(batchData.batchQuantity || 0),
        requestedQty: Number(batchData.batchQuantity || 0),
        receivedQty: 0,
        consumedQty: 0,
        producedQty: batchProducedQty,
        availableStock: batchProducedQty,
        itemImageUrl: itemImageMap ? itemImageMap.get(targetMainItemId) || null : null,
      });
    }

    const rawMaterials = Array.from(rawMaterialsMap.values()).map((item) => {
      const availableStock = Math.max(0, Number(item.receivedQty || 0) - Number(item.consumedQty || 0));
      return {
        ...item,
        availableStock,
        requiredQtyFormatted: this.general.formatQuantityWithUom(item.requiredQty, item.uomName),
        requestedQtyFormatted: this.general.formatQuantityWithUom(item.requestedQty, item.uomName),
        receivedQtyFormatted: this.general.formatQuantityWithUom(item.receivedQty, item.uomName),
        consumedQtyFormatted: this.general.formatQuantityWithUom(item.consumedQty, item.uomName),
        producedQtyFormatted: this.general.formatQuantityWithUom(item.producedQty, item.uomName),
        availableStockFormatted: this.general.formatQuantityWithUom(availableStock, item.uomName),
      };
    });

    const semiFinished = Array.from(semiFinishedMap.values()).map((item) => {
      const availableStock = Math.max(0, Number(item.producedQty || 0) - Number(item.consumedQty || 0));
      return {
        ...item,
        availableStock,
        requiredQtyFormatted: this.general.formatQuantityWithUom(item.requiredQty, item.uomName),
        requestedQtyFormatted: this.general.formatQuantityWithUom(item.requestedQty, item.uomName),
        receivedQtyFormatted: this.general.formatQuantityWithUom(item.receivedQty, item.uomName),
        consumedQtyFormatted: this.general.formatQuantityWithUom(item.consumedQty, item.uomName),
        producedQtyFormatted: this.general.formatQuantityWithUom(item.producedQty, item.uomName),
        availableStockFormatted: this.general.formatQuantityWithUom(availableStock, item.uomName),
      };
    });

    const finishedProducts = Array.from(finishedProductsMap.values()).map((item) => {
      const availableStock = Number(item.producedQty || 0);
      return {
        ...item,
        availableStock,
        requiredQtyFormatted: this.general.formatQuantityWithUom(item.requiredQty, item.uomName),
        requestedQtyFormatted: this.general.formatQuantityWithUom(item.requestedQty, item.uomName),
        receivedQtyFormatted: this.general.formatQuantityWithUom(item.receivedQty, item.uomName),
        consumedQtyFormatted: this.general.formatQuantityWithUom(item.consumedQty, item.uomName),
        producedQtyFormatted: this.general.formatQuantityWithUom(item.producedQty, item.uomName),
        availableStockFormatted: this.general.formatQuantityWithUom(availableStock, item.uomName),
      };
    });

    return {
      rawMaterials,
      semiFinished,
      finishedProducts,
    };
  }
}
