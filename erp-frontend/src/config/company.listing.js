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






// # Implementation Plan: Config-Driven List & Grid Cards

// To make `CompanyListCard` and `CompanyGridCard` config-based, we will extend the existing `company.config.json` to define the layout for these specific views, eliminating hardcoded keys inside the components.

// ## Proposed Changes

// ### 1. Extend `company.config.json`
// We will add two new config blocks to map fields specifically for the list and grid views:

// ```json
// "listCard": {
//   "primary": {
//     "image": "logoUrl",
//     "title": "companyName",
//     "subtitle": "companyCode"
//   },
//   "columns": [
//     { "label": "Email", "key": "email", "type": "text" },
//     { "label": "Phone", "key": "phone", "type": "phone" },
//     { "label": "Status", "key": "status", "type": "statusBadge" }
//   ],
//   "expanded": [
//     { "label": "Legal Name", "key": "legalName", "type": "text" },
//     { "label": "Registration No.", "key": "registrationNumber", "type": "text" },
//     { "label": "Contact Person", "key": "contactPersonName", "type": "text" },
//     { "label": "Added Date", "key": "addedDateFormatted", "type": "text" }
//   ]
// },
// "gridCard": {
//   "header": {
//     "image": "logoUrl",
//     "title": "companyName",
//     "subtitle": "shortName",
//     "badge": "status"
//   },
//   "details": [
//     { "icon": "Mail", "key": "email", "type": "text" },
//     { "icon": "Phone", "key": "phone", "type": "phone" }
//   ],
//   "footer": {
//     "date": "addedDateFormatted"
//   }
// }
// ```

// ### 2. Refactor `CompanyListCard.jsx`
// - Replace hardcoded field rendering with loops that map over `config.listCard.columns` and `config.listCard.expanded`.
// - Use the existing `CellRenderer` for rendering values based on their types (e.g., `statusBadge`, `phone`).
// - Use the `primary` mapping for the main left-column display (Logo + Name + Code).

// ### 3. Refactor `CompanyGridCard.jsx`
// - Replace hardcoded fields with loops over `config.gridCard.details`.
// - Use `resolvePath` to extract dynamic keys from the header configuration.

// ## User Review Required
// > [!IMPORTANT]
// > Please review this structure. This will ensure that both the List and Grid views are strictly driven by `company.config.json`. Once approved, I will implement the changes directly to `CompanyListCard.jsx` and `CompanyGridCard.jsx`.
 