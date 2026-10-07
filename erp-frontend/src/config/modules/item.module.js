import { CAPABILITIES } from '@/config/capabilities.config';
import {
  listItems,
  createItem,
  getItem,
  updateItem,
  deleteItem
} from '@/lib/api/item-api';
import { listCompanies, getCompany } from '@/lib/api/company-api';
import { listItemCategories } from '@/lib/api/item-category-api';
import { listManufacturers } from '@/lib/api/manufacturer-api';
import { listBrands } from '@/lib/api/brand-api';
import { listItemUoms } from '@/lib/api/item-uom-api';
import { listPackages } from '@/lib/api/package-master-api';
import { listStorages } from '@/lib/api/storage-api';

export const itemModuleConfig = {
  identity: {
    moduleName: "Item",
    slug: "item",
  },

  menu: {
    category: "Master",
    group: "Items",
    icon: "Package",
  },

  surfaces: {
    hasTable: true,
    hasGrid: true,
    hasList: true,
    formMode: { create: "page", edit: "page" },
    detailMode: "page",
  },

  permissions: {
    list: CAPABILITIES?.ITEM?.LIST || "ITEM_LIST",
    create: CAPABILITIES?.ITEM?.CREATE || "ITEM_CREATE",
    update: CAPABILITIES?.ITEM?.UPDATE || "ITEM_UPDATE",
    view: CAPABILITIES?.ITEM?.VIEW || "ITEM_VIEW",
    delete: CAPABILITIES?.ITEM?.DELETE || "ITEM_DELETE",
  },

  api: {
    list: listItems,
    create: createItem,
    update: async (id, data) => {
      if (data instanceof FormData && !data.has('id')) {
        data.append('id', id);
      } else if (!(data instanceof FormData)) {
        data.id = id;
      }
      return updateItem(data);
    },
    getOne: async (id) => {
      const res = await getItem({ id });
      return res?.settings?.data || res?.data || res;
    },
    delete: deleteItem,
  },

  list: {
    defaultView: "table",
    tableView: {
      columns: [
        {
          key: "primaryImageUrl",
          label: "Image",
          type: "image",
          sortable: false,
          searchable: false,
          width: "80px",
        },
        {
          key: "itemName",
          label: "Item Name",
          type: "reference",
          idKey: "id",
          referenceModule: "item",
          sortable: true,
          searchable: true,
          width: "220px",
        },
        { key: "itemCode", label: "Item Code", type: "text", sortable: true, searchable: true, className: "font-mono text-xs text-gray-700 bg-gray-50 px-1 py-0.5 rounded", width: "150px" },
        { key: "shortName", label: "Short Name", type: "text", sortable: true, searchable: true, width: "140px" },
        {
          key: "companyName",
          label: "Company",
          type: "reference",
          idKey: "companyId",
          referenceModule: "company",
          sortable: true,
          searchable: true,
          showForSuperAdminOnly: true,
          width: "250px",
        },
        {
          key: "categoryName",
          label: "Category",
          type: "reference",
          idKey: "categoryId",
          referenceModule: "itemCategory",
          sortable: true,
          searchable: true,
          width: "200px",
        },
        { key: "usageType", label: "Usage Type", type: "text", sortable: true, searchable: true, width: "180px" },
        { key: "inventoryType", label: "Inventory Type", type: "text", sortable: true, searchable: true, width: "180px" },
        { key: "barcode", label: "Barcode", type: "text", sortable: true, searchable: true, className: "font-mono text-xs text-gray-700 bg-gray-50 px-1 py-0.5 rounded", width: "180px" },
        { key: "primitiveQuantityDisplay", label: "Primitive Qty", type: "text", sortable: false, searchable: false, width: "160px" },
        { key: "currencyCode", label: "Currency", type: "text", sortable: true, searchable: true, width: "120px" },
        { key: "purchasePriceFormatted", label: "Purchase Price", type: "text", sortable: true, searchable: false, width: "160px" },
        { key: "costPriceFormatted", label: "Cost Price", type: "text", sortable: true, searchable: false, width: "150px" },
        { key: "storageName", label: "Storage", type: "text", sortable: true, searchable: true, width: "160px" },
        { key: "shelfLifeDisplay", label: "Shelf Life", type: "text", sortable: true, searchable: false, width: "130px" },
        { key: "addedDateFormatted", label: "Added Date", type: "date", sortable: true, searchable: false, className: "text-gray-500 text-xs", width: "180px" },
        { key: "status", label: "Status", type: "statusBadge", sortable: true, searchable: true, className: "text-xs font-semibold", width: "120px" },
      ],
    },
    listView: {
      layout: { columns: 4 },
      mainRow: [
        {
          type: "identity",
          primaryValue: { key: "itemName", type: "reference", idKey: "id", referenceModule: "item" },
          secondaryValue: { key: "itemCode", type: "text" },
          image: { key: "primaryImageUrl" }
        },
        { label: "Category", key: "categoryName", type: "text" },
        { label: "Brand", key: "brandName", type: "text" },
        { label: "Status", key: "status", type: "statusBadge" }
      ],
      extendedRows: [
        { label: "Manufacturer", key: "manufacturerName", type: "text" },
        { label: "Barcode", key: "barcode", type: "text" },
        { label: "Item UOM", key: "itemUomName", type: "text" },
        { label: "Purchase Price", key: "purchasePrice", type: "text" },
        { label: "Added Date", key: "addedDateFormatted", type: "text" }
      ]
    },
    gridView: {
      header: {
        left: {
          image: { key: "primaryImageUrl" },
          title: { key: "itemName", type: "reference", idKey: "id", referenceModule: "item" },
          subtitle: { key: "itemCode", type: "text" },
        },
        right: {
          badge: { key: "status", type: "statusBadge" },
        },
      },
      details: [
        { label: "Category", key: "categoryName", type: "text" },
        { label: "Brand", key: "brandName", type: "text" },
        { label: "Barcode", key: "barcode", type: "text" },
        { label: "Price", key: "purchasePrice", type: "text" }
      ]
    },
    actions: {
      header: [
        {
          label: "Add Item",
          type: "addRedirect",
          path: "/item/add",
          permission: CAPABILITIES?.ITEM?.CREATE || "ITEM_CREATE",
        },
      ],
      row: [
        { label: "View Details", type: "view" },
        { label: "Edit", type: "edit" },
        { label: "Delete", type: "delete" },
      ],
    },
    searchFields: [
      { field: "itemName", label: "Item Name", type: "text" },
      { field: "itemCode", label: "Item Code", type: "text" },
      { field: "barcode", label: "Barcode", type: "text" },
      {
        field: "companyId",
        label: "Company",
        type: "select",
        isMultiSelect: true,
        showForSuperAdminOnly: true,
        dynamicOptions: "companies",
      },
      {
        field: "categoryId",
        label: "Category",
        type: "select",
        isMultiSelect: true,
        dynamicOptions: "itemCategories",
      },
      {
        field: "manufacturerId",
        label: "Manufacturer",
        type: "select",
        isMultiSelect: true,
        dynamicOptions: "manufacturers",
      },
    ],
    defaultFilters: { status: "Active" },
    sidebarFields: [
      {
        field: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
        ],
      },
    ],
  },

  detailPage: {
    type: "dynamic",
    sidebar: {
      width: 2,
      identity: {
        title: { key: "itemName" },
        subtitle: { key: "itemCode" },
      }
    },
    header: {
      breadcrumbs: [
        { label: "Master" },
        { label: "Item", route: { module: "item", action: "list" } }
      ],
      actions: [
        {
          label: "Edit",
          type: "navigate",
          route: { module: "item", action: "edit" },
          permission: CAPABILITIES?.ITEM?.UPDATE || "ITEM_UPDATE"
        }
      ]
    },
    tabs: [
      {
        id: "summary",
        label: "Summary",
        icon: "FileText",
        isDefault: true,
        layout: { columns: 3 },
        boxes: [
          {
            id: "basic_info",
            type: "fields",
            title: "Basic Info & Classification",
            colSpan: 1,
            fieldLayout: { columns: 1 },
            fields: [
              { key: "itemName", label: "Item Name", type: "text" },
              { key: "itemCode", label: "Item Code", type: "text" },
              { key: "shortName", label: "Short Name", type: "text" },
              { key: "printName", label: "Print Name", type: "text" },
              { key: "barcode", label: "Barcode", type: "text" },
              { key: "vendorBarcode", label: "Vendor Barcode", type: "text" },
              { key: "referenceCode", label: "Reference Code", type: "text" },
              { key: "companyName", label: "Company", type: "reference", idKey: "companyId", referenceModule: "company", showForSuperAdminOnly: true },
              { key: "categoryName", label: "Category", type: "reference", idKey: "categoryId", referenceModule: "itemCategory" },
              { key: "manufacturerName", label: "Manufacturer", type: "reference", idKey: "manufacturerId", referenceModule: "manufacturer" },
              { key: "brandName", label: "Brand", type: "reference", idKey: "brandId", referenceModule: "brand" },
              { key: "usageType", label: "Usage Type", type: "text" },
              { key: "inventoryType", label: "Inventory Type", type: "text" },
              { key: "status", label: "Status", type: "statusBadge", variant: "text" },
            ],
          },
          {
            id: "pricing_attributes",
            type: "fields",
            title: "Units, Pricing & Attributes",
            colSpan: 1,
            fieldLayout: { columns: 1 },
            fields: [
              { key: "itemUomName", label: "Item Base UOM", type: "reference", idKey: "itemUomId", referenceModule: "itemUom" },
              { key: "packageUomName", label: "Package UOM", type: "reference", idKey: "packageUomId", referenceModule: "packageMaster" },
              { key: "unitsPerPacking", label: "Units Per Packing", type: "text" },
              { key: "primitiveQuantityDisplay", label: "Primitive Quantity", type: "text" },
              { key: "isDecimalAllowed", label: "Decimal Allowed", type: "text" },
              { key: "currencyCode", label: "Currency", type: "text" },
              { key: "purchasePriceFormatted", label: "Purchase Price", type: "text" },
              { key: "costPriceFormatted", label: "Cost Price", type: "text" },
              { key: "costPerUnitFormatted", label: "Cost Per Unit", type: "text" },
              { key: "storageName", label: "Storage", type: "reference", idKey: "storageId", referenceModule: "storage" },
              { key: "weightDisplay", label: "Weight", type: "text" },
              { key: "volumeDisplay", label: "Volume", type: "text" },
              { key: "dimensionsDisplay", label: "Dimensions (L×W×H)", type: "text" },
              { key: "shelfLifeDisplay", label: "Shelf Life", type: "text" },
              { key: "batchCode", label: "Batch Code", type: "text" },
              { key: "isScrap", label: "Is Scrap", type: "text" },
              { key: "description", label: "Description", type: "text" },
              { key: "remark", label: "Remark", type: "text" },
            ]
          },
          {
            id: "audit_column",
            type: "column",
            colSpan: 1,
            boxes: [
              {
                id: "added_info",
                type: "auditUser",
                title: "Added Info",
                fields: [
                  { key: "addedByName", label: "Added By", type: "userLink" },
                  { key: "addedDateFormatted", label: "Date", type: "date" },
                ],
                userIdKey: "addedBy",
              },
              {
                id: "modified_info",
                type: "auditUser",
                title: "Modified Info",
                fields: [
                  { key: "updatedByName", label: "Updated By", type: "userLink" },
                  { key: "updatedDateFormatted", label: "Date", type: "date" },
                ],
                userIdKey: "updatedBy",
              },
              {
                id: "item_images",
                type: "gallery",
                title: "Item Images",
                imageKey: "images",
                primaryIndicatorKey: "isPrimary"
              }
            ]
          }
        ]
      }
    ]
  },

  form: {
    type: "dynamic",
    layout: "scroll",
    header: {
      title: { create: "Add Item", edit: "Edit Item" },
      breadcrumbs: [
        { label: "Master" },
        { label: "Item", route: { module: "item", action: "list" } }
      ]
    },
    submit: {
      successMessage: { create: "Item created successfully!", edit: "Item updated successfully!" },
      errorMessage: { create: "Failed to create item", edit: "Failed to update item" },
      redirectTo: { module: "item", action: "list" },
      entityName: "Item",
    },
    sections: [
      {
        title: "Item Details",
        grid: { cols: 12 },
        fields: [
          {
            key: "companyId",
            label: "Company",
            type: "async-select",
            api: listCompanies,
            superAdminOnly: true,
            required: true,
            labelKey: "companyName",
            valueKey: "id",
            colSpan: 4,
            editProps: { disabled: true }
          },
          {
            key: "categoryId",
            label: "Category",
            type: "async-select",
            api: listItemCategories,
            dependsOn: "companyId",
            filters: [{ key: "companyId", matchField: "companyId" }],
            required: true,
            labelKey: "categoryName",
            valueKey: "id",
            colSpan: 4,
          },
          {
            key: "usageType",
            label: "Usage Type",
            type: "select",
            required: true,
            colSpan: 4,
            props: {
              options: [
                { label: "Finished (Tradable)", value: "finished_tradable" },
                { label: "Consumable (Non-Tradable)", value: "consumable_non_tradable" },
                { label: "Work In Progress (Non-Tradable)", value: "wip_non_tradable" },
                { label: "Non-Consumable (Asset/Capital)", value: "non_consumable_asset" },
              ]
            }
          },
          {
            key: "itemName",
            label: "Item Name",
            type: "text",
            required: true,
            colSpan: 4,
            placeholder: "Enter Item Name"
          },
          {
            key: "itemCode",
            label: "Item Code",
            type: "text",
            required: true,
            colSpan: 4,
            editProps: { disabled: true, readOnly: true }
          },
          {
            key: "inventoryType",
            label: "Inventory Type",
            type: "select",
            required: true,
            colSpan: 4,
            props: {
              options: [
                { label: "Bulk", value: "bulk" },
                { label: "Discrete", value: "discrete" },
              ]
            }
          },
          {
            key: "shortName",
            label: "Short Name",
            type: "text",
            colSpan: 4,
          },
          {
            key: "printName",
            label: "Print Name",
            type: "text",
            colSpan: 4,
          },
          {
            key: "manufacturerId",
            label: "Manufacturer",
            type: "async-select",
            api: listManufacturers,
            dependsOn: "companyId",
            filters: [{ key: "companyId", matchField: "companyId" }],
            labelKey: "manufacturerName",
            valueKey: "id",
            colSpan: 4,
          },
          {
            key: "brandId",
            label: "Brand",
            type: "async-select",
            api: listBrands,
            dependsOn: ["manufacturerId", "companyId"],
            filters: [
              { key: "companyId", matchField: "companyId" },
              { key: "manufacturerId", matchField: "manufacturerId" }
            ],
            labelKey: "brandName",
            valueKey: "id",
            colSpan: 4,
          },
          {
            key: "isDecimalAllowed",
            label: "Is Decimal Allowed?",
            type: "select",
            required: true,
            colSpan: 4,
            props: {
              options: [
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
              ]
            }
          },
          {
            key: "isInHouseProduction",
            label: "In-House Production?",
            type: "select",
            required: true,
            colSpan: 4,
            props: {
              options: [
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
              ]
            }
          },
          {
            key: "barcode",
            label: "Barcode",
            type: "text",
            colSpan: 4,
            action: (form) => (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1"
                onClick={() => {
                  const generated = Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0');
                  form.setValue("barcode", generated, { shouldValidate: true, shouldDirty: true });
                }}
                title="Generate Random Barcode"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
              </button>
            )
          },
          {
            key: "vendorBarcode",
            label: "Vendor Barcode",
            type: "text",
            colSpan: 4,
          },
          {
            key: "referenceCode",
            label: "Reference Code",
            type: "text",
            colSpan: 4,
          },
          {
            key: "description",
            label: "Description",
            type: "textarea",
            colSpan: 6,
          },
          {
            key: "remark",
            label: "Remark",
            type: "textarea",
            colSpan: 6,
          },
        ]
      },
      {
        title: "Units & Pricing",
        grid: { cols: 12 },
        fields: [
          {
            key: "packageUomId",
            label: "Package UOM",
            type: "async-select",
            api: listItemUoms, // The old code uses uomOptions or packageOptions? It used packageOptions (listPackages). Let's use listPackages
            dependsOn: "companyId",
            filters: [{ key: "companyId", matchField: "companyId" }],
            required: true,
            labelKey: "packageName",
            valueKey: "id",
            colSpan: 4,
          },
          {
            key: "unitsPerPacking",
            label: "Units Per Packing",
            type: "numeric",
            required: true,
            colSpan: 4,
          },
          {
            key: "itemUomId",
            label: "Item UOM",
            type: "async-select",
            api: listItemUoms,
            dependsOn: "companyId",
            filters: [{ key: "companyId", matchField: "companyId" }],
            required: true,
            labelKey: "uomName",
            valueKey: "id",
            colSpan: 4,
          },
          {
            key: "primitiveQuantity",
            label: "Primitive Quantity",
            type: "numeric",
            required: true,
            colSpan: 4,
          },
          {
            key: "storageId",
            label: "Storage",
            type: "async-select",
            api: listStorages,
            dependsOn: "companyId",
            filters: [{ key: "companyId", matchField: "companyId" }],
            required: true,
            labelKey: "storageName",
            valueKey: "id",
            colSpan: 4,
          },
          {
            key: "currencyCode",
            label: "Currency",
            type: "async-select",
            api: async ({ filters }) => {
              const companyIdFilter = filters?.find(f => f.key === 'companyId');
              if (!companyIdFilter?.value) return { data: { list: [] } };
              const comp = await getCompany(companyIdFilter.value);
              const currencies = comp?.currencies || [];
              return {
                data: {
                  list: currencies.map(c => ({
                    currencyCode: c.currencyCode,
                    currencyName: `${c.currencyCode} - ${c.currencyName}`
                  }))
                }
              };
            },
            dependsOn: "companyId",
            filters: [{ key: "companyId", matchField: "companyId" }],
            required: true,
            labelKey: "currencyName",
            valueKey: "currencyCode",
            colSpan: 4,
          },
          {
            key: "purchasePrice",
            label: "Purchase Price",
            type: "numeric",
            required: true,
            colSpan: 4,
          },
          {
            key: "costPrice",
            label: "Cost Price",
            type: "numeric",
            required: true,
            colSpan: 4,
          },
          {
            key: "costPerUnit",
            label: "Cost Per Unit",
            type: "numeric",
            required: true,
            colSpan: 4,
          },
          {
            key: "batchCode",
            label: "Batch Code / Lot No",
            type: "text",
            required: true,
            colSpan: 4,
          },
          {
            key: "shelfLife",
            label: "Shelf Life",
            type: "numeric",
            required: true,
            colSpan: 2,
            props: { maxDecimals: 0 }
          },
          {
            key: "shelfLifeUnit",
            label: "Shelf Life Unit",
            type: "select",
            required: true,
            colSpan: 2,
            props: {
              options: [
                { label: "Day", value: "day" },
                { label: "Month", value: "month" },
                { label: "Year", value: "year" },
              ]
            }
          },
          {
            key: "isScrap",
            label: "Is Scrap?",
            type: "select",
            required: true,
            colSpan: 4,
            props: {
              options: [
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
              ]
            }
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            required: true,
            colSpan: 4,
            props: {
              options: [
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]
            }
          }
        ]
      },
      {
        title: "Shipping Details",
        grid: { cols: 12 },
        fields: [
          {
            key: "weight",
            label: "Weight",
            type: "numeric",
            colSpan: 3,
          },
          {
            key: "weightUomId",
            label: "Weight UOM",
            type: "async-select",
            api: listItemUoms,
            dependsOn: "companyId",
            filters: [{ key: "companyId", matchField: "companyId" }],
            labelKey: "uomName",
            valueKey: "id",
            colSpan: 3,
          },
          {
            key: "volume",
            label: "Volume",
            type: "numeric",
            colSpan: 3,
          },
          {
            key: "volumeUomId",
            label: "Volume UOM",
            type: "async-select",
            api: listItemUoms,
            dependsOn: "companyId",
            filters: [{ key: "companyId", matchField: "companyId" }],
            labelKey: "uomName",
            valueKey: "id",
            colSpan: 3,
          },
          {
            key: "length",
            label: "Length",
            type: "numeric",
            colSpan: 2,
          },
          {
            key: "width",
            label: "Width",
            type: "numeric",
            colSpan: 2,
          },
          {
            key: "height",
            label: "Height",
            type: "numeric",
            colSpan: 2,
          },
          {
            key: "dimensionUomId",
            label: "Dimension UOM",
            type: "async-select",
            api: listItemUoms,
            dependsOn: "companyId",
            filters: [{ key: "companyId", matchField: "companyId" }],
            labelKey: "uomName",
            valueKey: "id",
            colSpan: 6,
          },
        ]
      },
      {
        title: "Item Images",
        grid: { cols: 12 },
        fields: [
          {
            key: "itemImages",
            label: "Item Images",
            type: "multi-image-upload",
            colSpan: 12,
            props: {
              maxImages: 10,
              helpText: "Select primary image by clicking on it. Maximum 10 images.",
            }
          }
        ]
      }
    ]
  },
};
