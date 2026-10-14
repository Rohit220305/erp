import { CAPABILITIES } from "@/config/capabilities.config";
import { createMasterModuleApi } from "@/lib/api/master-api";

export const expenseModuleConfig = {
  identity: {
    moduleName: "Expense",
    slug: "expense",
  },

  drawerDetails: true,

  surfaces: {
    hasTable: true,
    hasGrid: false,
    hasList: false,
    formMode: { create: "page", edit: "page" },
    detailMode: "drawer",
    hasDrawerDetails: true,
    drawerDetails: true,
  },

  permissions: {
    list: CAPABILITIES?.MASTER?.LIST || "MASTER_DATA_LIST",
    create: CAPABILITIES?.MASTER?.CREATE || "MASTER_DATA_CREATE",
    update: CAPABILITIES?.MASTER?.UPDATE || "MASTER_DATA_UPDATE",
    view: CAPABILITIES?.MASTER?.VIEW || "MASTER_DATA_VIEW",
    delete: CAPABILITIES?.MASTER?.DELETE || "MASTER_DATA_DELETE",
  },

  api: createMasterModuleApi("expense"),

  list: {
    defaultView: "table",
    tableView: {
      columns: [
        {
          key: "name",
          label: "Expense Name",
          type: "reference",
          idKey: "id",
          referenceModule: "expense",
          sortable: true,
          searchable: true,
        },
        {
          key: "code",
          label: "Expense Code",
          type: "text",
          sortable: true,
          searchable: true,
        },
        {
          key: "type",
          label: "Type",
          type: "text",
          sortable: true,
          searchable: true,
        },
        {
          key: "amount",
          label: "Amount",
          type: "currency",
          sortable: true,
          formatOptions: { decimals: 4 },
        },
        {
          key: "remark",
          label: "Remark",
          type: "text",
          sortable: false,
        },
        {
          key: "status",
          label: "Status",
          type: "statusBadge",
          className: "text-xs font-semibold",
        },
      ],
    },
    detailPath: "/expense/{id}",
    primaryAction: { type: "drawer" },
    actions: {
      header: [
        {
          label: "Add Expense",
          type: "addRedirect",
          path: "/expense/add",
          permission: CAPABILITIES?.MASTER?.CREATE || "MASTER_DATA_CREATE",
        },
      ],
      row: [
        {
          label: "Edit",
          type: "editRedirect",
          path: "/expense/edit/{id}",
          permission: CAPABILITIES?.MASTER?.UPDATE || "MASTER_DATA_UPDATE",
        },
        {
          label: "Delete",
          type: "deleteModal",
          permission: CAPABILITIES?.MASTER?.DELETE || "MASTER_DATA_DELETE",
          danger: true,
        },
        {
          label: "View",
          type: "viewDrawer",
          permission: CAPABILITIES?.MASTER?.VIEW || "MASTER_DATA_VIEW",
        },
      ],
    },
    searchFields: [
      { field: "name", label: "Expense Name", type: "text" },
      { field: "code", label: "Expense Code", type: "text" },
      { field: "type", label: "Type", type: "text" },
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
      {
        field: "type",
        label: "Expense Type",
        type: "select",
        options: [
          { value: "Hourly", label: "Hourly" },
          { value: "Fixed", label: "Fixed" },
          { value: "Other", label: "Other" },
        ],
      },
    ],
  },

  form: {
    type: "dynamic",
    layout: "scroll",
    header: {
      title: { create: "Add Expense", edit: "Edit Expense" },
      breadcrumbs: [
        { label: "Master" },
        { label: "Expense", route: { module: "expense", action: "list" } },
      ],
    },
    submit: {
      successMessage: {
        create: "Expense created successfully!",
        edit: "Expense updated successfully!",
      },
      errorMessage: {
        create: "Failed to create expense",
        edit: "Failed to update expense",
      },
      redirectTo: { module: "expense", action: "list" },
      entityName: "Expense",
    },
    sections: [
      {
        title: "Basic Details",
        grid: { cols: 2 },
        fields: [
          {
            key: "name",
            label: "Expense Name",
            type: "text",
            required: true,
            placeholder: "Enter Expense Name",
            validation: { message: "Please enter Expense Name." },
            fullWidth: false,
            autoGenerateCode: "code"
          },
          {
            key: "type",
            label: "Type",
            type: "select",
            required: true,
            placeholder: "Select Type",
            validation: { message: "Please select Type." },
            fullWidth: false,
            props: {
              options: [
                { value: "Hourly", label: "Hourly" },
                { value: "Fixed", label: "Fixed" },
                { value: "Other", label: "Other" },
              ],
            },
          },
          {
            key: "code",
            label: "Expense Code",
            type: "text",
            required: true,
            placeholder: "Enter Expense Code",
            validation: { message: "Please enter Expense Code." },
            editProps: { disabled: true },
            transform: "UPPERCASE_UNDERSCORE",
            fullWidth: false,
          },
          {
            key: "amount",
            label: "Amount",
            type: "currency",
            required: true,
            placeholder: "Enter Amount",
            validation: { message: "Please enter Amount." },
            fullWidth: false,
            props: {
              min: 0,
              maxDecimals: 4,
            },
          },
          {
            key: "remark",
            label: "Remark",
            type: "textarea",
            required: false,
            placeholder: "Enter Remark",
            info: "Additional remarks or notes for this expense",
            fullWidth: false,
            props: {
              rows: 3,
            },
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            required: true,
            placeholder: "Select Status",
            defaultValue: "Active",
            validation: { message: "Please select Status." },
            fullWidth: false,
            props: {
              isClearable: true,
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

  drawer: {
    title: "Expense",
    header: {
      title: { key: "name", type: "text" },
      subtitle: { key: "code", type: "text" },
      badge: { key: "status", type: "statusBadge" },
    },
    primaryAction: {
      label: "More Details",
      path: "/expense/{id}",
      permission: CAPABILITIES?.MASTER?.VIEW || "MASTER_DATA_VIEW",
    },
    sections: [
      {
        fields: [
          { key: "name", label: "Expense Name", type: "text" },
          { key: "code", label: "Expense Code", type: "text" },
          { key: "type", label: "Type", type: "text" },
          { key: "amount", label: "Amount", type: "currency" },
          { key: "remark", label: "Remark", type: "text" },
          { key: "status", label: "Status", type: "statusBadge" },
        ],
      },
      {
        fields: [
          { key: "addedByName", label: "Added By", type: "text" },
          { key: "addedDateFormatted", label: "Added Date", type: "text" },
          { key: "updatedByName", label: "Updated By", type: "text", hideIfEmpty: true },
          { key: "updatedDateFormatted", label: "Updated Date", type: "text", hideIfEmpty: true },
        ],
      },
    ],
  },

  detailPage: {
    type: "dynamic",
    sidebar: {
      width: 2,
      identity: {
        title: { key: "name" },
        subtitle: { key: "code" },
        badge: { key: "status", type: "statusBadge", variant: "text" },
      },
    },
    header: {
      breadcrumbs: [
        { label: "Master" },
        { label: "Expense", route: { module: "expense", action: "list" } },
      ],
      actions: [
        {
          label: "Edit",
          type: "navigate",
          route: { module: "expense", action: "edit" },
          permission: CAPABILITIES?.MASTER?.UPDATE || "MASTER_DATA_UPDATE",
        },
      ],
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
            id: "expense_info",
            type: "fields",
            title: "Expense Information",
            colSpan: 1,
            fieldLayout: { columns: 1 },
            fields: [
              { key: "name", label: "Expense Name", type: "text" },
              { key: "code", label: "Expense Code", type: "text" },
              { key: "type", label: "Type", type: "text" },
              { key: "amount", label: "Amount", type: "currency" },
              { key: "remark", label: "Remark", type: "text" },
              { key: "companyName", label: "Company", type: "text", showForSuperAdminOnly: true },
              { key: "status", label: "Status", type: "statusBadge", variant: "text" },
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
              },
            ],
          },
        ],
      },
    ],
  },

};


