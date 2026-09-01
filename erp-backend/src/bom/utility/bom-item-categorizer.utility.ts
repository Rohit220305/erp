import { MaterialType } from '../enum/bom.enum';

export interface BomProcessItemCategorizationInput {
  id: number;
  bomId?: number;
  processTemplateMappingId?: number;
  materialType: MaterialType | string;
  itemId: number;
  quantity: number | string; // Qty per unit
  isInternalTransfer?: boolean;
  sequenceNo?: number;
  processId?: number;
  processName?: string;
  processCode?: string;
  itemName?: string;
  itemCode?: string;
  costPrice?: number | string | null;
  purchasePrice?: number | string | null;
  itemImageUrl?: string | null;
  primitiveQuantity?: number | string | null;
  itemUomName?: string | null;
  packageUomName?: string | null;
}

export interface CategorizedItemDetail {
  id: number;
  itemId: number;
  itemName: string;
  itemCode: string;
  materialType: string;
  isInternalTransfer: boolean;
  sequenceNo: number;
  processId: number;
  processName: string;
  processCode: string;
  qtyPerUnit: number;
  qtyPerUnitDisplay: string;
  unitPrice: number;
  unitPriceFormatted: string;
  totalRequiredQty: number;
  totalRequiredQtyDisplay: string;
  totalCost: number;
  totalCostFormatted: string;
  itemImageUrl: string | null;
}

export interface CategorizedItemsResult {
  rawMaterials: CategorizedItemDetail[];
  semiFinished: CategorizedItemDetail[];
  finishedProducts: CategorizedItemDetail[];
}

export class BomItemCategorizerUtility {
  /**
   * Categorizes BOM process items into 3 distinct material tabs:
   * 1. Raw Materials: Entry items where isInternalTransfer = false
   * 2. Semi-Finished Products: Entry items where isInternalTransfer = true, OR Exit items where isInternalTransfer = true
   * 3. Finished Products: Exit items where isInternalTransfer = false (terminal output)
   */
  static categorizeItems(
    items: BomProcessItemCategorizationInput[],
    packageQuantity: number = 1,
    currencySymbol: string = '',
  ): CategorizedItemsResult {
    const rawMaterials: CategorizedItemDetail[] = [];
    const semiFinished: CategorizedItemDetail[] = [];
    const finishedProducts: CategorizedItemDetail[] = [];

    for (const item of items) {
      const isEntry = item.materialType === MaterialType.Entry || item.materialType === 'Entry';
      const isInternal = Boolean(item.isInternalTransfer);

      const numQtyPerUnit = typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity || 0));
      const rawCostPrice = item.costPrice !== undefined && item.costPrice !== null ? parseFloat(String(item.costPrice)) : 0;
      const rawPurchasePrice = item.purchasePrice !== undefined && item.purchasePrice !== null ? parseFloat(String(item.purchasePrice)) : 0;

      const unitPrice = rawCostPrice > 0 ? rawCostPrice : (rawPurchasePrice > 0 ? rawPurchasePrice : 0);
      const totalRequiredQty = parseFloat((numQtyPerUnit * packageQuantity).toFixed(4));
      const totalCost = parseFloat((totalRequiredQty * unitPrice).toFixed(4));

      const uomSuffix = item.itemUomName ? ` ${item.itemUomName}` : '';
      const symbolPrefix = currencySymbol ? `${currencySymbol} ` : '';

      const detail: CategorizedItemDetail = {
        id: Number(item.id),
        itemId: Number(item.itemId),
        itemName: item.itemName || '',
        itemCode: item.itemCode || '',
        materialType: isEntry ? 'Entry' : 'Exit',
        isInternalTransfer: isInternal,
        sequenceNo: Number(item.sequenceNo || 0),
        processId: Number(item.processId || 0),
        processName: item.processName || '',
        processCode: item.processCode || '',
        qtyPerUnit: numQtyPerUnit,
        qtyPerUnitDisplay: `${numQtyPerUnit.toFixed(2)}${uomSuffix}`,
        unitPrice,
        unitPriceFormatted: (isEntry && !isInternal && unitPrice > 0) ? `${symbolPrefix}${unitPrice.toFixed(2)}` : 'NA',
        totalRequiredQty,
        totalRequiredQtyDisplay: `${totalRequiredQty.toFixed(2)}${uomSuffix}`,
        totalCost,
        totalCostFormatted: isEntry && !isInternal && totalCost > 0 ? `${symbolPrefix}${totalCost.toFixed(2)}` : 'NA',
        itemImageUrl: item.itemImageUrl || null,
      };

      if (isEntry) {
        if (!isInternal) {
          rawMaterials.push(detail);
        } else {
          semiFinished.push(detail);
        }
      } else {
        if (isInternal) {
          semiFinished.push(detail);
        } else {
          finishedProducts.push(detail);
        }
      }
    }

    return {
      rawMaterials,
      semiFinished,
      finishedProducts,
    };
  }
}
