export const sitemapData = [
  {
    title: "Dashboards",
    menus: [{ label: "Sitemap", path: "/" }],
    path: "/",
  },
  {
    title: "Company",
    permission: "COMPANY_VIEW",
    menus: [
      { label: "Company Master", path: "/company", permission: "COMPANY_VIEW" },
      // { label: "Add Company", path: "/company/add" },
    ],
    path: "/company",
  },
  {
    title: "Groups and Roles",
    permission: "GROUP_VIEW",
    menus: [
      { label: "Groups", path: "/group", permission: "GROUP_VIEW" },
      // { label: "Add Group", path: "/group/add" },
    ],
    path: "/group",
  },
  {
    title: "Users & Staff Management",
    permission: "USER_VIEW",
    menus: [
      { label: "Admin Users", path: "/admin", permission: "USER_VIEW" },
      // { label: "Add User", path: "/admin/add" },
    ],
    path: "/admin",
  },
];


