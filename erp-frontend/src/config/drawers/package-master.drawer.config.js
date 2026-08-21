export const PackageMasterDrawerConfig = {
  title: "Package Type Details",
  header: {
    title: {
      type: "text",
      key: "packageName",
    },
    badge: {
      key: "status",
      type: "statusBadge",
    },
  },
  primaryAction: {
    label: "More Details",
    permission: "PACKAGE_VIEW",
    path: "/package-master/{id}",
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Package Type Name", key: "packageName", type: "text" },
        { label: "Company", key: "companyName", type: "text", showForSuperAdminOnly: true },
        { label: "Package Type Code", key: "packageCode", type: "text" },
        { label: "Abbreviation", key: "abbreviation", type: "text" },
        { label: "Description", key: "description", type: "longText" },
      ],
    },
  ],
};
