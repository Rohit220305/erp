export const itemUomDrawerConfig = {
  title: "Item UOM Details",
  header: {
    title: {
      type: "field",
      key: "uomName",
    },
    badge: {
      key: "status",
      activeValue: "Active",
    },
  },
  primaryAction: {
    label: "More Details",
    path: "/item-uom/{id}",
    permission: "ITEM_UOM_VIEW",
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "UOM Name", key: "uomName" },
        { label: "UOM Code", key: "itemUomCode" },
        { label: "ISO Code", key: "isoCode" },
        { label: "Abbreviation", key: "abbreviation" },
        { label: "Unit Type", key: "unitType" }
      ],
    },
  ],
};
