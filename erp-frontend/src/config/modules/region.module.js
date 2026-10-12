import { CAPABILITIES } from '@/config/capabilities.config';
import { createMasterModuleApi } from '@/lib/api/master-api';

export const regionModuleConfig = {
  identity: {
    moduleName: "Region",
    slug: "region",
  },

  drawerDetails: true,

  // menu: {
  //   category: "Master",
  //   group: "Region",
  //   icon: "MapPin",
  // },

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

  api: createMasterModuleApi("region"),

  list: {
    defaultView: "table",
    tableView: {
      columns: [
        {
          key: "regionName",
          label: "Region Name",
          type: "reference",
          idKey: "id",
          referenceModule: "region",
          sortable: true,
          searchable: true,
        },
        {
          key: "regionCode",
          label: "Region Code",
          type: "text",
          sortable: true,
          searchable: true,
        },
        {
          key: "description",
          label: "Description",
          type: "text",
          sortable: false,
          searchable: false,
        },
        {
          key: "status",
          label: "Status",
          type: "statusBadge",
          className: "text-xs font-semibold",
        },
      ],
    },
    detailPath: "/region/{id}",
    primaryAction: { type: "drawer" },
    actions: {
      header: [
        {
          label: "Add Region",
          type: "addRedirect",
          path: "/region/add",
          permission: CAPABILITIES?.MASTER?.CREATE || "MASTER_DATA_CREATE",
        },
      ],
      row: [
        {
          label: "Edit",
          type: "editRedirect",
          path: "/region/edit/{id}",
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
      { field: "regionName", label: "Region Name", type: "text" },
      { field: "regionCode", label: "Region Code", type: "text" },
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
      title: { create: "Add Region", edit: "Edit Region" },
      breadcrumbs: [
        { label: "Master" },
        { label: "Region", route: { module: "region", action: "list" } },
      ],
    },
    submit: {
      successMessage: {
        create: "Region created successfully!",
        edit: "Region updated successfully!",
      },
      errorMessage: {
        create: "Failed to create region",
        edit: "Failed to update region",
      },
      redirectTo: { module: "region", action: "list" },
      entityName: "Region",
    },
    sections: [
      {
        title: "Basic Details",
        grid: { cols: 2 },
        fields: [
          {
            key: "regionName",
            label: "Region Name",
            type: "text",
            required: true,
            placeholder: "Enter Region Name",
            validation: { message: "Please enter Region Name." },
            fullWidth: false,
          },
          {
            key: "regionCode",
            label: "Region Code",
            type: "text",
            required: true,
            placeholder: "Enter Region Code",
            validation: { message: "Please enter Region Code." },
            editProps: { disabled: true },
            fullWidth: false,
          },
          {
            key: "description",
            label: "Description",
            type: "textarea",
            required: false,
            placeholder: "Enter Description",
            fullWidth: true,
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

  drawer: {
    title: "Region",
    header: {
      title: { key: "regionName", type: "text" },
      subtitle: { key: "regionCode", type: "text" },
      badge: { key: "status", type: "statusBadge" },
    },
    primaryAction: {
      label: "More Details",
      path: "/region/{id}",
      permission: CAPABILITIES?.MASTER?.VIEW || "MASTER_DATA_VIEW",
    },
    sections: [
      {
        
        fields: [
          { key: "regionName", label: "Region Name", type: "text" },
          { key: "regionCode", label: "Region Code", type: "text" },
          { key: "description", label: "Description", type: "text" },
          { key: "status", label: "Status", type: "statusBadge" },
        ],
      },
      {
       
        fields: [
          { key: "addedByName", label: "Added By", type: "text" },
          { key: "addedDateFormatted", label: "Added Date", type: "text" },
          { key: "updatedByName", label: "Updated By", type: "text" },
          { key: "updatedDateFormatted", label: "Updated Date", type: "text" },
        ],
      },
    ],
  },

  detailPage: {
    type: "dynamic",
    sidebar: {
      width: 2,
      identity: {
        title: { key: "regionName" },
        subtitle: { key: "regionCode" },
        badge: { key: "status", type: "statusBadge", variant: "text" },
      },
    },
    header: {
      breadcrumbs: [
        { label: "Master" },
        { label: "Region", route: { module: "region", action: "list" } },
      ],
      actions: [
        {
          label: "Edit",
          type: "navigate",
          route: { module: "region", action: "edit" },
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
            id: "region_info",
            type: "fields",
            title: "Region Information",
            colSpan: 1,
            fieldLayout: { columns: 1 },
            fields: [
              {
                key: "regionName",
                label: "Region Name",
                type: "text",
              },
              {
                key: "regionCode",
                label: "Region Code",
                type: "text",
              },
              {
                key: "description",
                label: "Description",
                type: "text",
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
