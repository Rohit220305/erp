export const ManufacturerDrawerConfig = {
  title: "Manufacturer",
  header: {
    title: {
      type: "text",
      key: "manufacturerName",
    },
    badge: {
      key: "status",
      type: "statusBadge",
    },
  },
  primaryAction: {
    label: "More Details",
    permission: "MANUFACTURER_VIEW",
    path: "/manufacturer/{id}",
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Manufacturer Name", key: "manufacturerName", type: "text" },
        { label: "Company", key: "companyName", type: "text", showForSuperAdminOnly: true },
        { label: "Manufacturer Code", key: "manufacturerCode", type: "text" },
        { label: "Reference Code", key: "referenceCode", type: "text" },
      ],
    },
  ],
};
