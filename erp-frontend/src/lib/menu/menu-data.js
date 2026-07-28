
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
    ],
  },
];
