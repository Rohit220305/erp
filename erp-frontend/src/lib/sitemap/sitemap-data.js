export const sitemapData = [
  {
    title: "Dashboards",
    menus: [{ label: "Sitemap", path: "/" }],
    path: "/",
  },
  {
    title: "Company",
    permission: "COMPANY_LIST",
    menus: [
      { label: "Company Master", path: "/company", permission: "COMPANY_LIST" },
      // { label: "Add Company", path: "/company/add" },
    ],
    path: "/company",
  },
  {
    title: "Groups and Roles",
    permission: "GROUP_LIST",
    menus: [
      { label: "Groups", path: "/group", permission: "GROUP_LIST" },
      // { label: "Add Group", path: "/group/add" },
    ],
    path: "/group",
  },
  {
    title: "Users & Staff Management",
    permission: "USER_LIST",
    menus: [
      { label: "Users", path: "/admin", permission: "USER_LIST" },
      // { label: "Add User", path: "/admin/add" },
    ],
    path: "/admin",
  },
  // {
  //   title: "System Audit",
  //   superAdminOnly: true,
  //   menus: [
  //     { label: "Activity Logs", path: "/admin/activity-logs", superAdminOnly: true },
  //   ],
  //   path: "/admin/activity-logs",
  // },

  {
    title: "Currency",
    permission: "CURRENCY_LIST",
    menus: [
      { label: "Currency Master", path: "/currency", permission: "CURRENCY_LIST" },
      // { label: "Add Currency", path: "/currency/add" },
    ],
    path: "/currency",
  },
  {
    title: "Work Centre Category",
    permission: "WORK_CENTRE_CATEGORY_LIST",
    menus: [
      { label: "Work Centre Categories", path: "/work-centre-category", permission: "WORK_CENTRE_CATEGORY_LIST" },
    ],
    path: "/work-centre-category",
  },
  {
    title: "Package Types",
    permission: "PACKAGE_LIST",
    menus: [
      { label: "Package Types", path: "/package-master", permission: "PACKAGE_LIST" },
    ],
    path: "/package-master",
  },
  {
    title: "Manufacturer",
    permission: "MANUFACTURER_LIST",
    menus: [
      { label: "Manufacturer", path: "/manufacturer", permission: "MANUFACTURER_LIST" },
    ],
    path: "/manufacturer",
  },
  {
    title: "Item UOM",
    permission: "ITEM_UOM_LIST",
    menus: [
      { label: "Item UOM", path: "/item-uom", permission: "ITEM_UOM_LIST" },
    ],
    path: "/item-uom",
  },
  {
    title: "Storage",
    permission: "STORAGE_LIST",
    menus: [
      { label: "Storage Type", path: "/storage", permission: "STORAGE_LIST" },
    ],
    path: "/storage",
  },
  {
    title: "Item Category",
    permission: "ITEM_CATEGORY_LIST",
    menus: [
      { label: "Item Category", path: "/item-category", permission: "ITEM_CATEGORY_LIST" },
    ],
    path: "/item-category",
  },
  {
    title: "Item Master",
    permission: "ITEM_LIST",
    menus: [
      { label: "Item Master", path: "/item", permission: "ITEM_LIST" },
    ],
    path: "/item",
  },
  {
    title: "Brand Master",
    permission: "BRAND_LIST",
    menus: [
      { label: "Brand", path: "/brand", permission: "BRAND_LIST" },
    ],
    path: "/brand",
  },
  {
    title: "Work Centre Master",
    permission: "WORK_CENTRE_LIST",
    menus: [
      { label: "Work Centre", path: "/work-centre", permission: "WORK_CENTRE_LIST" },
    ],
    path: "/work-centre",
  },
  {
    title: "Process Master",
    permission: "PROCESS_LIST",
    menus: [
      { label: "Process Master", path: "/process", permission: "PROCESS_LIST" },
    ],
    path: "/process",
  }
];
