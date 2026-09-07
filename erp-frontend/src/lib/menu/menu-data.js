import { buildRoute } from "@/lib/navigation/routeBuilder";

export const menuCategories = [
  {
    category: "Dashboard",
    icon: "LayoutDashboard",
    groups: [
      {
        title: "Dashboards",
        icon: "Home",
        iconBg: "#1565c0",
        items: [{ label: "Sitemap", path: buildRoute("home", "list") }],
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
          { label: "Users", path: buildRoute("user", "list"), permission: "USER_LIST" },
          { label: "Groups", path: buildRoute("group", "list"), permission: "GROUP_LIST" },
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
            path: buildRoute("manufacturer", "list"),
            permission: "MANUFACTURER_LIST",
          },
          { label: "Brand Master", path: buildRoute("brand", "list"), permission: "BRAND_LIST" },
          {
            label: "Item Category",
            path: buildRoute("item-category", "list"),
            permission: "ITEM_CATEGORY_LIST",
          },
          {
            label: "Storage Type",
            path: buildRoute("storage", "list"),
            permission: "STORAGE_LIST",
          },
          { label: "Item", path: buildRoute("item", "list"), permission: "ITEM_LIST" },
        ],
      },
      {
        title: "Item Unit",
        icon: "Boxes",
        iconBg: "#1565c0",
        permission: "ITEM_UOM_LIST",
        items: [
          { label: "Item UOM", path: buildRoute("item-uom", "list"), permission: "ITEM_UOM_LIST" },
          {
            label: "Package Types",
            path: buildRoute("package-master", "list"),
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
            path: buildRoute("currency", "list"),
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
            path: buildRoute("company", "list"),
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
            label: "Work Centre Category",
            path: buildRoute("work-centre-category", "list"),
            permission: "WORK_CENTRE_CATEGORY_LIST",
          },
          {
            label: "Work Centre",
            path: buildRoute("work-centre", "list"),
            permission: "WORK_CENTRE_LIST",
          },
          {
            label: "Process Master",
            path: buildRoute("process", "list"),
            permission: "PROCESS_LIST",
          },
          {
            label: "Process Template",
            path: buildRoute("process-template", "list"),
            permission: "PROCESS_TEMPLATE_LIST",
          },
        ],
      },
    ],
  },
  {
    category: "Production",
    icon: "Package",
    groups: [
      {
        title: "Manufacturing",
        icon: "Package",
        iconBg: "#1565c0",
        permission: "PRODUCTION_ORDER_LIST",
        items: [
          {
            label: "Bill Of Materials",
            path: buildRoute("bom", "list"),
            permission: "BOM_LIST",
          },
          {
            label: "Production Order",
            path: buildRoute("production-order", "list"),
            permission: "PRODUCTION_ORDER_LIST",
          },
          // {
          //   label: "Production Batch",
          //   path: buildRoute("production-batch", "list"),
          //   permission: "PRODUCTION_BATCH_LIST",
          // },
        ],
      },
    ],
  },
];
