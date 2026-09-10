export const sitemapData = [
  {
    title: "Dashboards",
    menus: [{ label: "Sitemap", path: "/" }],
    path: "/",
  },
  {
    title: "Company",
    menus: [
      { label: "Company Master", path: "/company", permission: "COMPANY_LIST" },
    ],
  },
  {
    title: "Users Management",
    menus: [
      { label: "Users", path: "/admin", permission: "USER_LIST" },
      { label: "Groups", path: "/group", permission: "GROUP_LIST" },
    ],
  },

  {
    title: "Currency",
    menus: [
      {
        label: "Currency Master",
        path: "/currency",
        permission: "CURRENCY_LIST",
      },
    ],
    path: "/currency",
  },
  {
    title: "Item Unit",
    menus: [
      { label: "Item UOM", path: "/item-uom", permission: "ITEM_UOM_LIST" },
      {
        label: "Package Types",
        path: "/package-master",
        permission: "PACKAGE_LIST",
      },
    ],
  },
  {
    title: "Item Management",
    menus: [
      {
        label: "Manufacturer",
        path: "/manufacturer",
        permission: "MANUFACTURER_LIST",
      },
      { label: "Brand", path: "/brand", permission: "BRAND_LIST" },
      { label: "Storage Type", path: "/storage", permission: "STORAGE_LIST" },
      {
        label: "Item Category",
        path: "/item-category",
        permission: "ITEM_CATEGORY_LIST",
      },
      { label: "Item Master", path: "/item", permission: "ITEM_LIST" },
    ],
  },
  {
    title: "Process Management",
    menus: [
      {
        label: "Work Centre Category",
        path: "/work-centre-category",
        permission: "WORK_CENTRE_CATEGORY_LIST",
      },
      {
        label: "Work Centre",
        path: "/work-centre",
        permission: "WORK_CENTRE_LIST",
      },
      { label: "Process Master", path: "/process", permission: "PROCESS_LIST" },
      {
        label: "Process Template",
        path: "/process-template",
        permission: "PROCESS_TEMPLATE_LIST",
      },
      
    ],
  },
  {
    title: "Manufacturing",
    menus: [
      {
        label: "Bill of Materials",
        path: "/bom",
        permission: "BOM_LIST",
      },
      {
        label: "Production Order",
        path: "/production-order",
        permission: "PRODUCTION_ORDER_LIST",
      },
      {
        label: "Production Batch",  
        path: "/production-batch",
        permission: "PRODUCTION_BATCH_LIST",
      },
      
      
    ],
  }



];









