import { Package } from "lucide-react";

export const itemDrawerConfig = {
  title: "Item Details",
  header: {
    image: {
      key: "primaryImageUrl",
      fallbackType: "icon",
      fallbackIcon: Package,
    },
    title: {
      type: "text",
      key: "itemName",
    },
    badge: {
      key: "status",
      type: "statusBadge",
    },
  },
  primaryAction: {
    label: "More Details",
    permission: "ITEM_VIEW",
    path: "/item/{id}",
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Item Name", key: "itemName", type: "text" },
        { label: "Item Code", key: "itemCode", type: "text" },
        { label: "Short Name", key: "shortName", type: "text" },
        { label: "Print Name", key: "printName", type: "text" },
        {
          label: "Company",
          key: "companyName",
          type: "text",
          showForSuperAdminOnly: true,
        },
        { label: "Barcode", key: "barcode", type: "text" },
        { label: "Shelf Life", key: "shelfLifeDisplay", type: "text" },
        { label: "Storage Details", key: "storageName", type: "text" },
            { label: "Usage Type", key: "usageType", type: "text" },
      ],
    },
    // {
    //   title: "Classification",
    //   fields: [
    //     { label: "Category", key: "categoryName", type: "text" },
    //     { label: "Manufacturer", key: "manufacturerName", type: "text" },
    //     { label: "Brand", key: "brandName", type: "text" },
    //     { label: "Usage Type", key: "usageType", type: "text" },
    //     { label: "Inventory Type", key: "inventoryType", type: "text" },
    //     { label: "Storage", key: "storageName", type: "text" },
    //   ],
    // },
    // {
    //   title: "Packaging & Units",
    //   fields: [
    //     { label: "Item UOM", key: "itemUomName", type: "text" },
    //     { label: "Package UOM", key: "packageUomName", type: "text" },
    //     { label: "Units Per Packing", key: "unitsPerPacking", type: "text" },
    //     { label: "Primitive Quantity", key: "primitiveQuantity", type: "text" },
    //     { label: "Is Decimal Allowed", key: "isDecimalAllowed", type: "text" },
    //   ],
    // },
    // {
    //   title: "Pricing",
    //   fields: [
    //     { label: "Currency", key: "currencyName", type: "text" },
    //     { label: "Purchase Price", key: "purchasePrice", type: "text" },
    //     { label: "Cost Price", key: "costPrice", type: "text" },
    //     { label: "Cost Per Unit", key: "costPerUnit", type: "text" },
    //   ],
    // },
    // {
    //   title: "Physical Attributes",
    //   fields: [
    //     { label: "Weight", key: "weight", type: "text" },
    //     { label: "Volume", key: "volume", type: "text" },
    //     { label: "Length", key: "length", type: "text" },
    //     { label: "Width", key: "width", type: "text" },
    //     { label: "Height", key: "height", type: "text" },
    //   ],
    // },
    // {
    //   title: "Lifecycle",
    //   fields: [
    //     { label: "Shelf Life", key: "shelfLife", type: "text" },
    //     { label: "Shelf Life Unit", key: "shelfLifeUnit", type: "text" },
    //     { label: "Batch Code", key: "batchCode", type: "text" },
    //     { label: "Is Scrap", key: "isScrap", type: "text" },
    //     { label: "Description", key: "description", type: "text", fullWidth: true },
    //   ],
    // },
  ],
};
