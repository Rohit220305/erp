export const userDrawerConfig = {
  title: "User Details",
  header: {
    image: { 
      key: "photoUrl", 
      fallbackType: "initials", 
      fallbackKeys: ["firstName", "lastName"] 
    },
    title: { 
      type: "compositeText", 
      keys: ["firstName", "lastName"], 
      separator: " " 
    },
    badge: { 
      key: "status", 
      type: "statusBadge" 
    }
  },
  primaryAction: {
    label: "More Details",
    permission: "USER_VIEW",
    path: "/admin/{id}"
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Email", key: "email", type: "text" },
        { 
          label: "Phone", 
          type: "compositeText", 
          keys: ["dialCode", "phone"], 
          separator: " " 
        },
        { label: "Group", key: "groupName", type: "text" },
        { label: "Company", key: "companyName", type: "text" },
        { label: "Added Date", key: "addedDateFormatted", type: "text" },
        { label: "Updated Date", key: "updatedDateFormatted", type: "text" }
      ]
    }
  ]
};
