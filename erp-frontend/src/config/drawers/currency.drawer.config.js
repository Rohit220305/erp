export const currencyDrawerConfig = {
  title: "Currency Details",
  header: {
    title: { 
      type: "text", 
      key: "currencyName" 
    },
    badge: { 
      key: "status", 
      type: "statusBadge" 
    }
  },
  primaryAction: {
    label: "More Details",
    permission: "CURRENCY_VIEW",
    path: "/currency/{id}"
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Currency Code", key: "currencyCode", type: "text" },
        { label: "Currency Name", key: "currencyName", type: "text" },
        { label: "Currency Symbol", key: "currencySymbol", type: "text" }
      ]
    }
  ]
};
