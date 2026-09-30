import { Injectable } from '@nestjs/common';
import { MaterialType } from '../enum/bom.enum';
import { GeneralUtilities } from '../../package/utilities/general.utilities';

export interface BomProcessItemCategorizationInput {
  id: number;
  bomId?: number;
  processTemplateMappingId?: number;
  materialType: MaterialType | string;
  itemId: number;
  quantity: number | string;
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
  uomName?: string | null;
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
  uomName: string;
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

@Injectable()
export class BomItemCategorizerService {
  constructor(private readonly generalUtil: GeneralUtilities) {}

  categorizeItems(
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

      const uomName = item.itemUomName || item.uomName || '';
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
        qtyPerUnitDisplay: this.generalUtil.formatQuantityWithUom(numQtyPerUnit, uomName),
        unitPrice,
        uomName,
        unitPriceFormatted: (isEntry && !isInternal && unitPrice > 0) ? `${symbolPrefix}${Number(unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'NA',
        totalRequiredQty,
        totalRequiredQtyDisplay: this.generalUtil.formatQuantityWithUom(totalRequiredQty, uomName),
        totalCost,
        totalCostFormatted: isEntry && !isInternal && totalCost > 0 ? `${symbolPrefix}${Number(totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'NA',
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
