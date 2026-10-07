import { CAPABILITIES } from '@/config/capabilities.config';
import {
  listCurrencies,
  createCurrency,
  getCurrency,
  updateCurrency,
  deleteCurrency
} from '@/lib/api/currency-api';

export const currencyModuleConfig = {
  identity: {
    moduleName: "Currency",
    slug: "currency",
  },

  menu: {
    category: "Master",
    group: "Currencies",
    icon: "CircleDollarSign",
  },

  surfaces: {
    hasTable: true,
    hasGrid: true,
    hasList: true,
    formMode: { create: "page", edit: "page" },
    detailMode: "page",
  },

  permissions: {
    list: CAPABILITIES?.CURRENCY?.LIST || "CURRENCY_LIST",
    create: CAPABILITIES?.CURRENCY?.CREATE || "CURRENCY_CREATE",
    update: CAPABILITIES?.CURRENCY?.UPDATE || "CURRENCY_UPDATE",
    view: CAPABILITIES?.CURRENCY?.VIEW || "CURRENCY_VIEW",
    delete: CAPABILITIES?.CURRENCY?.DELETE || "CURRENCY_DELETE",
  },

  api: {
    list: listCurrencies,
    create: createCurrency,
    update: async (id, data) => updateCurrency({ id, ...data }),
    getOne: async (id) => {
      const res = await getCurrency({ id });
      return res?.settings?.data || res?.data || res;
    },
    delete: deleteCurrency,
  },

  list: {
    defaultView: "table",
    tableView: {
      columns: [
        {
          key: "currencyName",
          label: "Currency Name",
          type: "reference",
          idKey: "id",
          referenceModule: "currency",
          sortable: true,
          searchable: true,
        },
        {
          key: "currencyCode",
          label: "Currency Code",
          type: "reference",
          idKey: "id",
          referenceModule: "currency",
          sortable: true,
          searchable: true,
        },
        {
          key: "currencySymbol",
          label: "Currency Symbol",
          type: "text",
          sortable: true,
          searchable: true,
        },
        { key: "status", label: "Status", type: "statusBadge" , className: "text-xs font-semibold"},
      ],
    },
    listView: {
      layout: { columns: 4 },
      mainRow: [
        {
          type: "identity",
          primaryValue: { key: "currencyName", type: "reference", idKey: "id", referenceModule: "currency" },
          secondaryValue: { key: "currencyCode", type: "text", idKey: "id", referenceModule: "currency" }
        },
        { label: "Currency Symbol", key: "currencySymbol", type: "text" },
        { label: "Status", key: "status", type: "statusBadge" },
        {
          key: "currencyCode",
          label: "Currency Code",
          type: "reference",
          idKey: "id",
          referenceModule: "currency"
        }
      ],
      extendedRows: []
    },
    gridView: {
      header: {
        left: {
          title: { key: "currencyName", type: "reference", idKey: "id", referenceModule: "currency" },
          subtitle: { key: "currencyCode", type: "text" },
        },
        right: {
          badge: { key: "status", type: "statusBadge" },
        },
      },
      details: [
        { label: "Currency Symbol", key: "currencySymbol", type: "text", layout: "horizontal", variant: "standard" },
        {
          key: "currencyCode",
          label: "Currency Code",
          type: "text",
          layout: "horizontal",
          variant: "standard"
        }
      ]
    },
    actions: {
      header: [
        {
          label: "Add Currency",
          type: "addRedirect",
          path: "/currency/add",
          permission: CAPABILITIES?.CURRENCY?.CREATE || "CURRENCY_CREATE",
        },
      ],
      row: [
        { label: "View", type: "view" },
        { label: "Edit", type: "edit" },
        { label: "Delete", type: "delete" },
      ],
    },
    searchFields: [
      { field: "currencyName", label: "Currency Name", type: "text" },
      { field: "currencyCode", label: "Currency Code", type: "text" },
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

  form: {
    type: "dynamic",
    layout: "scroll",
    header: {
      title: { create: "Add Currency", edit: "Edit Currency" },
      breadcrumbs: [
        { label: "Master" },
        { label: "Currency", route: { module: "currency", action: "list" } },
      ],
    },
    submit: {
      successMessage: { create: "Currency created successfully!", edit: "Currency updated successfully!" },
      errorMessage: { create: "Failed to create currency", edit: "Failed to update currency" },
      redirectTo: { module: "currency", action: "list" },
      entityName: "Currency",
    },
    sections: [
      {
        title: "Basic Details",
        grid: { cols: 2 },
        fields: [
          {
            key: "currencyName",
            label: "Currency Name",
            type: "text",
            required: true,
            placeholder: "Enter Currency Name",
            validation: { message: "Please enter Currency Name." },
            fullWidth: false,
          },
          {
            key: "currencyCode",
            label: "Currency Code",
            type: "text",
            required: true,
            placeholder: "Enter Currency Code",
            validation: { message: "Please enter Currency Code." },
            editProps: { disabled: true },
            fullWidth: false,
          },
          {
            key: "currencySymbol",
            label: "Symbol",
            type: "text",
            required: false,
            placeholder: "Enter Symbol",
            fullWidth: false,
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            required: true,
            placeholder: "Select Status",
            validation: { message: "Please select Status." },
            defaultValue: "Active",
            fullWidth: false,
            props: {
              options: [
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ],
            },
          },
        ],
      },
    ],
  },

  detailPage: {
    type: "dynamic",
    sidebar: {
      width: 2,
      identity: {
        title: { key: "currencyName" },
        subtitle: { key: "currencyCode" },
        badge: { key: "status", type: "statusBadge", variant: "text" },
      }
    },
    header: {
      breadcrumbs: [
        { label: "Master" },
        { label: "Currency Master", route: { module: "currency", action: "list" } }
      ],
      actions: [
        {
          label: "Edit",
          type: "navigate",
          route: { module: "currency", action: "edit" },
          permission: CAPABILITIES?.CURRENCY?.UPDATE || "CURRENCY_UPDATE"
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
            id: "currency_info",
            type: "fields",
            title: "Currency Information",
            classes: {
              title: ""
            },
            colSpan: 1,
            fieldLayout: { columns: 1 },
            fields: [
              { 
                key: "currencyName", 
                label: "Currency Name", 
                type: "text",
                classes: {
                  value: ""
                }
              },
              { key: "currencyCode", label: "Currency Code", type: "text" },
              { key: "currencySymbol", label: "Symbol", type: "text" },
              { 
                key: "status", 
                label: "Status", 
                type: "statusBadge",
                classes: {
                  label: "",
                  value: "scale-105 origin-right"
                },
                variant: "text"
              },
            ],
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
              }
            ]
          }
        ]
      }
    ]
  },
};
