import { Injectable } from '@nestjs/common';

export interface CategorizedBatchItems {
  rawMaterials: any[];
  semiFinished: any[];
  finishedProducts: any[];
}

@Injectable()
export class BatchItemCategorizerUtility {
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
          requiredQty: Number(item.requiredQty || 0),
          requestedQty: Number(item.requestedQty || item.requestQty || 0),
          receivedQty: Number(item.receivedQty || 0),
          consumedQty: Number(item.consumedQty || 0),
          producedQty: Number(item.producedQty || 0),
          availableStock: Number(item.availableStock || 0),
          itemImageUrl: itemImageMap ? itemImageMap.get(itemId) || null : item.itemImageUrl || null,
        });
      } else {
        const existing = targetMap.get(itemId);
        existing.requiredQty += Number(item.requiredQty || 0);
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
        uomName: batchData.uomName ,
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

    const rawMaterials = Array.from(rawMaterialsMap.values()).map((item) => ({
      ...item,
      availableStock: Math.max(0, Number(item.receivedQty || 0) - Number(item.consumedQty || 0)),
    }));

    const semiFinished = Array.from(semiFinishedMap.values()).map((item) => ({
      ...item,
      availableStock: Math.max(0, Number(item.producedQty || 0) - Number(item.consumedQty || 0)),
    }));

    const finishedProducts = Array.from(finishedProductsMap.values()).map((item) => ({
      ...item,
      availableStock: Number(item.producedQty || 0),
    }));

    return {
      rawMaterials,
      semiFinished,
      finishedProducts,
    };
  }
}
