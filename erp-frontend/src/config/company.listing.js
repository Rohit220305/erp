export const companyListingConfig = {
  title: "Company Master",
  
  columns: [
    { label: "Logo", key: "logoUrl", width: "80px" },
    { label: "Company Name", key: "companyName", width: "220px" },
    { label: "Company Code", key: "companyCode", width: "130px" },
    { label: "Contact Person", key: "contactPersonName", width: "160px" },
    { label: "Email", key: "email", width: "220px" },
    { label: "Phone", key: "phone", width: "150px" },
    { label: "Added Date", key: "addedDateFormatted", width: "180px" },
    { label: "Status", key: "status", width: "110px" },
  ],

  searchFields: [
    { label: "Company Name", value: "companyName", type: "text" },
    { label: "Short Name", value: "shortName", type: "text" },
    { label: "Company Code", value: "companyCode", type: "text" },
    { label: "Company Email", value: "email", type: "text" },
    { label: "Company Phone", value: "phone", type: "text" },
    { label: "Contact Person", value: "contactPersonName", type: "text" },
    { label: "Status", value: "status", type: "select", options: [
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "Inactive" },
    ]}
  ],

  defaultFilters: {
    companyName: "",
    shortName: "",
    companyCode: "",
    email: "",
    phone: "",
    contactPersonName: "",
    status: "",
  },
  
  sidebarStatuses: [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ]
};




