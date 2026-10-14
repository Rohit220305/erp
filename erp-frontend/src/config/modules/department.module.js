import { CAPABILITIES } from "@/config/capabilities.config";
import { createMasterModuleApi } from "@/lib/api/master-api";

export const departmentModuleConfig = {
  identity: {
    moduleName: "Department",
    modulePlural: "Departments",
    slug: "department",
    description: "Manage organizational departments",
    icon: "Building2",
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

  api: createMasterModuleApi("department"),

  list: {
    defaultView: "table",
    tableView: {
      columns: [
        {
          key: "name",
          label: "Department Name",
          type: "reference",
          idKey: "id",
          referenceModule: "department",
          sortable: true,
          searchable: true,
        },
        {
          key: "code",
          label: "Department Code",
          type: "text",
          sortable: true,
          searchable: true,
        },
        {
          key: "slug",
          label: "Slug",
          type: "text",
          sortable: true,
          searchable: true,
        },
        {
          key: "companyName",
          label: "Company",
          type: "reference",
          idKey: "companyId",
          referenceModule: "company",
          showForSuperAdminOnly: true,
          sortable: true,
        },
        {
          key: "status",
          label: "Status",
          type: "statusBadge",
          className: "text-xs font-semibold",
          sortable: true,
        },
      ], // <-- Remove the dummy "actions" column from here
    },
    detailPath: "/department/{id}",
    primaryAction: { type: "drawer" },
    actions: {
      header: [
        {
          label: "Add Department",
          type: "addRedirect",
          path: "/department/add",
          permission: CAPABILITIES?.MASTER?.CREATE || "MASTER_DATA_CREATE",
        },
      ],
      row: [
        {
          label: "Edit",
          type: "editRedirect",
          path: "/department/edit/{id}",
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
      { field: "name", label: "Department Name", type: "text" },
      { field: "code", label: "Department Code", type: "text" },
      { field: "slug", label: "Department Slug", type: "text" },
    ],
    defaultFilters: { status: "Active" },
    sidebarFields: [
      {
        field: "name",
        label: "Department Name",
        type: "text",
        },
        {
            field: "code",  
            label: "Department Code",
            type: "text",
      },
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
      title: { create: "Add Department", edit: "Edit Department" },
      breadcrumbs: [
        { label: "Master" },
        {
          label: "Department",
          route: { module: "department", action: "list" },
        },
      ],
    },
    submit: {
      successMessage: {
        create: "Department created successfully!",
        edit: "Department updated successfully!",
      },
      errorMessage: {
        create: "Failed to create department",
        edit: "Failed to update department",
      },
      redirectTo: { module: "department", action: "list" },
      entityName: "Department",
    },
    sections: [
      {
        title: "Department Details",
        grid: { cols: 2 },
        fields: [
          {
            key: "name",
            label: "Name",
            type: "text",
            required: true,
            placeholder: "Enter Name",
            validation: { message: "Please enter Name." },
            fullWidth: false,
            autoGenerateCode: "code",
          },
          {
            key: "code",
            label: "Code",
            type: "text",
            required: true,
            placeholder: "Enter Code",
            validation: { message: "Please enter Code." },
            editProps: { disabled: true },
            transform: "UPPERCASE_UNDERSCORE",
            fullWidth: false,
          },
          {
            key: "slug",
            label: "Slug",
            type: "text",
            required: true,
            placeholder: "Enter Slug",
            validation: { message: "Please enter Slug." },
            editProps: { disabled: true },
            fullWidth: false,
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
    title: "Department",
    header: {
      title: { key: "name", type: "text" },
      subtitle: { key: "code", type: "text" },
      badge: { key: "status", type: "statusBadge" },
    },
    primaryAction: {
      label: "More Details",
      path: "/department/{id}",
      permission: CAPABILITIES?.MASTER?.VIEW || "MASTER_DATA_VIEW",
    },
    sections: [
      {
        fields: [
          { key: "name", label: "Department Name", type: "text" },
          { key: "code", label: "Department Code", type: "text" },
          { key: "slug", label: "Slug", type: "text" },
          { key: "status", label: "Status", type: "statusBadge" },
        ],
      },
      {
        fields: [
          { key: "addedByName", label: "Added By", type: "text" },
          { key: "addedDateFormatted", label: "Added Date", type: "text" },
          {
            key: "updatedByName",
            label: "Updated By",
            type: "text",
            hideIfEmpty: true,
          },
          {
            key: "updatedDateFormatted",
            label: "Updated Date",
            type: "text",
            hideIfEmpty: true,
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
        title: { key: "name" },
        subtitle: { key: "code" },
        badge: { key: "status", type: "statusBadge", variant: "text" },
      },
    },
    header: {
      breadcrumbs: [
        { label: "Master" },
        {
          label: "Department",
          route: { module: "department", action: "list" },
        },
      ],
      actions: [
        {
          label: "Edit",
          type: "navigate",
          route: { module: "department", action: "edit" },
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
            id: "department_info",
            type: "fields",
            title: "Department Information",
            colSpan: 1,
            fieldLayout: { columns: 1 },
            fields: [
              { key: "name", label: "Department Name", type: "text" },
              { key: "code", label: "Department Code", type: "text" },
              { key: "slug", label: "Slug", type: "text" },
              {
                key: "companyName",
                label: "Company",
                type: "text",
                showForSuperAdminOnly: true,
              },
              {
                key: "status",
                label: "Status",
                type: "statusBadge",
                variant: "text",
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
                  {
                    key: "updatedByName",
                    label: "Updated By",
                    type: "userLink",
                  },
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
