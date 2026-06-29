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







// # Company Module Redesign Walkthrough

// We have successfully completed the phase-wise implementation of the JSON-driven dynamic React module for the Company Module.

// Here is a summary of the changes and new components added.

// ## What was completed

// ### 1. JSON Configuration
// - Created `src/config/company.config.json`. This acts as the single source of truth for the company module. It defines columns, header actions, row actions, search fields, and default filters.

// ### 2. Core Dynamic Engine
// We created a reusable dynamic table rendering engine located in `src/components/core/dynamic-ui/`:
// - **`pathResolver.js`**: A pure utility to safely parse nested properties (like `owner.name`) via dot notation from backend response objects.
// - **`CellRenderer.jsx`**: Maps configured component types (`image`, `link`, `statusBadge`, `phone`, `text`) to React UI components on a per-cell basis. This eliminates hardcoded conditional rendering.
// - **`ActionRenderer.jsx`**: Evaluates row-level actions against the user's permissions via `useAuth().can()`. If allowed, it renders the corresponding action buttons (like Edit, Delete).
// - **`ConfigDrivenListing.jsx`**: Acts as a bridge between the JSON config and the existing `DynamicListing` component. It abstracts away column looping and handles the mapping of header and row actions securely.

// ### 3. Module Refactoring
// - Refactored `CompanyListPage.jsx`. We removed all manual table configurations (`renderCell` switch-case blocks) and hardcoded add/edit buttons.
// - The module is now remarkably thin and clean, only taking the configuration JSON and passing it to `<ConfigDrivenListing />`.
// - Additionally, we implemented a generic way to intercept row clicks (e.g., triggering a modal or navigating).

// ### 4. API Integrity & Build
// - Added the missing `deleteCompany` endpoint function to `src/lib/api/company-api.js` to ensure the delete row action works correctly.
// - Ran the production build `npm run build` which passed without errors.

// ## Validation Results
// - The build executed correctly.
// - Component paths and module imports were verified and successfully resolved.
// - You can now test the Company Module locally by navigating to the Companies tab. It should seamlessly render your columns (and nested properties) using the new architecture while honoring role permissions.

// > [!TIP]
// > **Future modules**: You can easily migrate other modules (e.g. User Module) to this approach just by writing a `[module].config.json` and wrapping their list page in `<ConfigDrivenListing />`.
