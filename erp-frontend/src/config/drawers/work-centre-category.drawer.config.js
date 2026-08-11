export const workCentreCategoryDrawerConfig = {
  title: "Work Centre Category Details",
  header: {
    title: {
      type: "text",
      key: "categoryName",
    },
    badge: {
      key: "status",
      type: "statusBadge",
    },
  },
  primaryAction: {
    label: "More Details",
    permission: "WORK_CENTRE_CATEGORY_VIEW",
    path: "/work-centre-category/{id}",
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Category Name", key: "categoryName", type: "text" },
        { label: "Category Code", key: "categoryCode", type: "text" },
      ],
    },
  ],
};
