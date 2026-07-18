export const companyListingConfig = {
  title: "Company Master",
  
  // Table Columns
  columns: [
    { label: "Logo", key: "logoUrl" },
    { label: "Company Name", key: "companyName" },
    { label: "Company Code", key: "companyCode" },
    { label: "Contact Person", key: "contactPersonName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Status", key: "status" },
    { label: "Added Date", key: "addedDateFormatted" },
  ],

  // Search Drawer Fields
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

  // Default Sidebar Filters
  defaultFilters: {
    companyName: "",
    shortName: "",
    companyCode: "",
    email: "",
    phone: "",
    contactPersonName: "",
    status: "",
  },
  
  // Sidebar Filter Statuses 
  sidebarStatuses: [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ]
};




