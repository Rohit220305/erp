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
      { label: "Admin Users", path: "/admin", permission: "USER_LIST" },
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
  }
];


