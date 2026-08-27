
export const menuCategories = [
  {
    category: "Dashboard",
    icon: "LayoutDashboard",
    groups: [
      {
        title: "Dashboards",
        icon: "Home",
        iconBg: "#1565c0",
        items: [{ label: "Sitemap", path: "/" }],
      },
    ],
  },
  {
    category: "Users",
    icon: "Users",
    permission: "USER_LIST",
    groups: [
      {
        title: "Users & Staff Management",
        icon: "Users",
        iconBg: "#1565c0",
        permission: "USER_LIST",
        items: [
          { label: "Users", path: "/admin", permission: "USER_LIST" },
          { label: "Groups", path: "/group", permission: "GROUP_LIST" },
        ],
      },
    ],
  },
  {
    category: "Master",
    icon: "BookOpen",
    groups: [
      {
        title: "Item Master",
        icon: "Settings",
        iconBg: "#1565c0",
        permission: "ITEM_LIST",
        items: [
          {
            label: "Manufacturer",
            path: "/manufacturer",
            permission: "MANUFACTURER_LIST",
          },
          { label: "Brand Master", path: "/brand", permission: "BRAND_LIST" },
          {
            label: "Item Category",
            path: "/item-category",
            permission: "ITEM_CATEGORY_LIST",
          },
          {
            label: "Storage Type",
            path: "/storage",
            permission: "STORAGE_LIST",
          },
          { label: "Item", path: "/item", permission: "ITEM_LIST" },
        ],
      },
      {
        title: "Item Unit",
        icon: "Boxes",
        iconBg: "#1565c0",
        permission: "ITEM_UOM_LIST",
        items: [
          { label: "Item UOM", path: "/item-uom", permission: "ITEM_UOM_LIST" },
          {
            label: "Package Types",
            path: "/package-master",
            permission: "PACKAGE_LIST",
          },
        ],
      },
      {
        title: "Currencies",
        icon: "CircleDollarSign",
        iconBg: "#1565c0",
        permission: "CURRENCY_LIST",
        items: [
          {
            label: "Currency Master",
            path: "/currency",
            permission: "CURRENCY_LIST",
          },
        ],
      },
      {
        title: "Company",
        icon: "Building",
        iconBg: "#1565c0",
        permission: "COMPANY_LIST",
        items: [
          {
            label: "Company Master",
            path: "/company",
            permission: "COMPANY_LIST",
          },
        ],
      },

      {
        title: "Process Management",
        icon: "Building2",
        iconBg: "#1565c0",
        permission: "WORK_CENTRE_CATEGORY_LIST",
        items: [
          {
            label: "Work Centre Categories",
            path: "/work-centre-category",
            permission: "WORK_CENTRE_CATEGORY_LIST",
          },
          {
            label: "Work Centre",
            path: "/work-centre",
            permission: "WORK_CENTRE_LIST",
          },
          {
            label: "Process Master",
            path: "/process",
            permission: "PROCESS_LIST",
          },
          {
            label: "Process Template",
            path: "/process-template",
            permission: "PROCESS_TEMPLATE_LIST",
          },
          {
            label: "BOM Master",
            path: "/bom",
            permission: "BOM_LIST",
          },
        ],
      },
     
    ],
  },
];

