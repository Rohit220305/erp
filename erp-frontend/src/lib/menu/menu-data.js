
export const menuCategories = [
  {
    category: "Dashboard",
    icon: "LayoutDashboard",
    groups: [
      {
        title: "Dashboards",
        icon: "Home",
        iconBg: "#1565c0",
        items: [
          { label: "Sitemap", path: "/" },
        ],
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
        ],
      },
    ],
  },
  {
    category: "Master",
    icon: "BookOpen",
    groups: [
      {
        title: "Company",
        icon: "Building2",
        iconBg: "#1565c0",
        permission: "COMPANY_LIST",
        items: [
          { label: "Company Master", path: "/company", permission: "COMPANY_LIST" },
        ],
      },
      {
        title: "Groups and Roles",
        icon: "Shield",
        iconBg: "#4caf50",
        permission: "GROUP_LIST",
        items: [
          { label: "Groups", path: "/group", permission: "GROUP_LIST" },
        ],
      },
      {
        title: "Currencies",
        icon: "CircleDollarSign",
        iconBg: "#ff9800",
        permission: "CURRENCY_LIST",
        items: [
          { label: "Currency Master", path: "/currency", permission: "CURRENCY_LIST" },
        ],
      },
      {
        title: "Work Centre Category",
        icon: "Layers",
        iconBg: "#1565c0",
        permission: "WORK_CENTRE_CATEGORY_LIST",
        items: [
          { label: "Work Centre Categories", path: "/work-centre-category", permission: "WORK_CENTRE_CATEGORY_LIST" },
        ],
      },
      {
        title: "Work Centre Master",
        icon: "Settings",
        iconBg: "#4caf50",
        permission: "WORK_CENTRE_LIST",
        items: [
          { label: "Work Centre", path: "/work-centre", permission: "WORK_CENTRE_LIST" },
        ],
      },
      {
        title: "Package Types",
        icon: "Package",
        iconBg: "#9c27b0",
        permission: "PACKAGE_LIST",
        items: [
          { label: "Package Types", path: "/package-master", permission: "PACKAGE_LIST" },
        ],
      },
      {
        title: "Manufacturer",
        icon: "Factory",
        iconBg: "#ff5722",
        permission: "MANUFACTURER_LIST",
        items: [
          { label: "Manufacturer", path: "/manufacturer", permission: "MANUFACTURER_LIST" },
        ],
      },
      {
        title: "Item UOM",
        icon: "Scale",
        iconBg: "#009688",
        permission: "ITEM_UOM_LIST",
        items: [
          { label: "Item UOM", path: "/item-uom", permission: "ITEM_UOM_LIST" },
        ],
      },
      {
        title: "Storage",
        icon: "Archive",
        iconBg: "#795548",
        permission: "STORAGE_LIST",
        items: [
          { label: "Storage Type", path: "/storage", permission: "STORAGE_LIST" },
        ],
      },
      {
        title: "Item Category",
        icon: "Tags",
        iconBg: "#607d8b",
        permission: "ITEM_CATEGORY_LIST",
        items: [
          { label: "Item Category", path: "/item-category", permission: "ITEM_CATEGORY_LIST" },
        ],
      },
      {
        title: "Item Master",
        icon: "Package",
        iconBg: "#607d8b",
        permission: "ITEM_LIST",
        items: [
          { label: "Item Master", path: "/item", permission: "ITEM_LIST" },
        ],
      },
      {
        title: "Brand Master",
        icon: "Tag",
        iconBg: "#e91e63",
        permission: "BRAND_LIST",
        items: [
          { label: "Brand", path: "/brand", permission: "BRAND_LIST" },
        ],
      },
      {
        title: "Process Master",
        icon: "Activity",
        iconBg: "#3f51b5",
        permission: "PROCESS_LIST",
        items: [
          { label: "Process Master", path: "/process", permission: "PROCESS_LIST" },
        ],
      },
    ],
  },
];
