import { MaterialType } from '../enum/bom.enum';

export interface ItemPriceLookup {
  id: number;
  costPrice?: number | string | null;
  purchasePrice?: number | string | null;
  itemName?: string;
  itemCode?: string;
}

export interface BomCostCalculationItem {
  itemId: number;
  materialType: MaterialType | string;
  quantity: number | string;
  isInternalTransfer?: boolean;
}

export interface BomCostBreakdown {
  totalUnitCost: number;
  entryItemCount: number;
  consideredItems: Array<{
    itemId: number;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  skippedTransferItems: Array<{
    itemId: number;
    quantity: number;
  }>;
}

export class BomCostUtility {
  /**
   * Dynamically calculates the live unit cost of a BOM.
   * - Evaluates ONLY 'Entry' materials.
   * - Skips internal transfer items (isInternalTransfer = true) to prevent double counting.
   * - Uses COALESCE(costPrice, purchasePrice, 0) from Item Master.
   * - Safely parses string numbers to float.
   */
  static calculateLiveCost(
    processItems: BomCostCalculationItem[],
    itemPriceMap: Map<number, ItemPriceLookup> | Record<number, ItemPriceLookup>,
  ): BomCostBreakdown {
    let totalUnitCost = 0;
    let entryItemCount = 0;

    const consideredItems: Array<{
      itemId: number;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }> = [];

    const skippedTransferItems: Array<{
      itemId: number;
      quantity: number;
    }> = [];

    const lookupMap =
      itemPriceMap instanceof Map
        ? itemPriceMap
        : new Map(Object.entries(itemPriceMap).map(([k, v]) => [Number(k), v]));

    for (const item of processItems) {
      // Only Entry items contribute to raw material cost
      if (item.materialType !== MaterialType.Entry && item.materialType !== 'Entry') {
        continue;
      }

      entryItemCount++;
      const numQuantity = typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity || 0));

      // Skip internal transfer items to prevent double counting upstream costs
      if (item.isInternalTransfer === true) {
        skippedTransferItems.push({
          itemId: item.itemId,
          quantity: numQuantity,
        });
        continue;
      }

      const itemInfo = lookupMap.get(Number(item.itemId));
      const rawCostPrice = itemInfo?.costPrice;
      const rawPurchasePrice = itemInfo?.purchasePrice;

      const numCostPrice = rawCostPrice !== undefined && rawCostPrice !== null ? parseFloat(String(rawCostPrice)) : 0;
      const numPurchasePrice = rawPurchasePrice !== undefined && rawPurchasePrice !== null ? parseFloat(String(rawPurchasePrice)) : 0;

      const unitPrice = numCostPrice > 0 ? numCostPrice : (numPurchasePrice > 0 ? numPurchasePrice : 0);
      const lineTotal = numQuantity * unitPrice;

      totalUnitCost += lineTotal;

      consideredItems.push({
        itemId: item.itemId,
        quantity: numQuantity,
        unitPrice,
        lineTotal,
      });
    }

    return {
      totalUnitCost: parseFloat(totalUnitCost.toFixed(4)),
      entryItemCount,
      consideredItems,
      skippedTransferItems,
    };
  }
}
