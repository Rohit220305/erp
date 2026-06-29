"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { restoreSession } from "@/lib/api/auth-api";

const AuthContext = createContext();

export function AuthProvider({ children, initialUser = null, initialCapabilities = [] }) {
  const [user, setUser] = useState(() => {
    if (!initialUser) return null;
    return {
      ...initialUser,
      isSuperAdmin: Number(initialUser.isSuperAdmin) === 1,
      sub: initialUser.id || initialUser.sub,
    };
  });
  const [capabilities, setCapabilities] = useState(initialCapabilities || []);
  const [sessionStack, setSessionStack] = useState([]);
  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load session stack and tokens on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedStack = localStorage.getItem("sessionStack");
      if (storedStack) {
        try {
          setSessionStack(JSON.parse(storedStack));
        } catch (e) {
          console.error("Failed to parse sessionStack from localStorage", e);
        }
      }
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        setToken(storedToken);
      }
      setIsInitializing(false);
    }
  }, []);

  const setAuthData = (userData, userCapabilities = []) => {
    const normalizedData = userData
      ? {
          ...userData,
          isSuperAdmin: Number(userData.isSuperAdmin) === 1,
          sub: userData.id || userData.sub,
        }
      : null;
    setUser(normalizedData);
    setCapabilities(userCapabilities);
  };

  const clearAuth = () => {
    setUser(null);
    setCapabilities([]);
    setSessionStack([]);
    setToken(null);
  };

  const can = (permission) => {
    if (user?.isSuperAdmin) return true;
    if (!capabilities || capabilities.length === 0) return false;
    return capabilities.includes(permission);
  };

  const login = (userData, userToken = null) => {
    setAuthData(userData, userData.capabilities || []);
    if (userToken) {
      setToken(userToken);
      localStorage.setItem("authToken", userToken);
    }
  };

  const logout = () => {
    clearAuth();
    localStorage.removeItem("sessionStack");
    localStorage.removeItem("authToken");
  };

  const loginAs = (newUserData, newToken = null) => {
    const currentToken = localStorage.getItem("authToken") || token;
    const newStack = [
      ...sessionStack,
      {
        user: user,
        capabilities: capabilities,
        token: currentToken,
      },
    ];

    setSessionStack(newStack);
    localStorage.setItem("sessionStack", JSON.stringify(newStack));

    setAuthData(newUserData, newUserData.capabilities || []);
    if (newToken) {
      setToken(newToken);
      localStorage.setItem("authToken", newToken);
    }
  };

  const backToSession = async () => {
    if (sessionStack.length === 0) return null;

    const prevSession = sessionStack[sessionStack.length - 1];
    const newStack = sessionStack.slice(0, -1);
    
    if (prevSession.token) {
      const res = await restoreSession(prevSession.token);
      if (!res || res.success !== 1) {
        logout();
        window.location.href = "/login";
        throw new Error(res?.message || "Failed to restore backend session");
      }
    }

    setSessionStack(newStack);
    localStorage.setItem("sessionStack", JSON.stringify(newStack));

    setAuthData(prevSession.user, prevSession.capabilities);
    if (prevSession.token) {
      setToken(prevSession.token);
      localStorage.setItem("authToken", prevSession.token);
    } else {
      setToken(null);
      localStorage.removeItem("authToken");
    }

    return prevSession;
  };

  const isAuthenticated = !!user;
  const isImpersonating = sessionStack.length > 0;
  const canImpersonate = user?.isSuperAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        capabilities,
        isAuthenticated,
        can,
        setAuthData,
        clearAuth,
        login,
        logout,
        loginAs,
        backToSession,
        sessionStack,
        isImpersonating,
        canImpersonate,
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}



// # Capability-Based Access Control — Implementation Plan

// ## Goal

// Enforce role-based access on all module pages using 5 capabilities per module:
// `LIST` → `VIEW` → `CREATE` → `UPDATE` → `DELETE`

// Applies to: **Company, Group, User, Marketing, Sales**

// SuperAdmin bypasses all checks (already handled by `can()` in `AuthContext`).

// ### Constraint
// - **Do not convert `page.js` files to `"use client"`** if they are currently server components.
// - Maintain a clean developer-understandable architecture by pushing auth logic into client components or higher-order components.

// ---

// ## Capability → Page mapping

// | Capability | What it guards |
// |---|---|
// | `{MODULE}_LIST` | Listing page (`/company`, `/group`, `/admin`) + sitemap card |
// | `{MODULE}_VIEW` | Detail page (`/company/[id]`, `/group/[id]`, `/admin/[id]`) |
// | `{MODULE}_CREATE` | Add page (`/company/add`, `/group/add`, `/admin/add`) + "Add" button |
// | `{MODULE}_UPDATE` | Edit page (`/company/[id]/edit-company`, `/group/edit/[id]`, etc.) + "Edit" button |
// | `{MODULE}_DELETE` | Delete button / action only (no separate page) |

// > ⚠️ **No cascading**: Each page checks ONLY its own specific permission. Accessing `/company/[id]` requires `COMPANY_VIEW` only, not `COMPANY_LIST + COMPANY_VIEW`.

// ---

// ## Proposed Architecture: The `AuthGuard` Component

// Instead of scattering `router.replace` everywhere, we will create a reusable `AuthGuard` client component.

// #### [NEW] [AuthGuard.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/common/AuthGuard.jsx)
// ```jsx
// "use client";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";

// export default function AuthGuard({ permission, children }) {
//   const { can, isInitializing } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isInitializing && !can(permission)) {
//       router.replace("/not-authorized");
//     }
//   }, [can, permission, router, isInitializing]);

//   if (isInitializing || !can(permission)) return null;

//   return children;
// }
// ```

// This allows `page.js` to remain a server component, while the client component it imports handles the auth check cleanly.

// ---

// ## Proposed Changes

// ### 1. Shared 403 Page

// #### [NEW] [not-authorized/page.js](file:///var/www/html/training/erp/erp-frontend/src/app/(home)/not-authorized/page.js)
// - Create a simple page displaying "403 – Permission Denied".

// ---

// ### 2. Sitemap — switch from VIEW to LIST

// #### [MODIFY] [sitemap-data.js](file:///var/www/html/training/erp/erp-frontend/src/lib/sitemap/sitemap-data.js)

// Change all section and menu `permission` values from `*_VIEW` → `*_LIST`:

// ```diff
// - permission: "COMPANY_VIEW"
// + permission: "COMPANY_LIST"

// - permission: "GROUP_VIEW"
// + permission: "GROUP_LIST"

// - permission: "USER_VIEW"
// + permission: "USER_LIST"
// ```

// ---

// ### 3. Company Module

// #### [MODIFY] [CompanyListPage.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/company/CompanyListPage.jsx)
// - Wrap return with `<AuthGuard permission="COMPANY_LIST">`
// - "Add Company" button: already guarded with `can("COMPANY_CREATE")` ✅

// #### [MODIFY] [CompanyAddForm.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/company/CompanyAddForm.jsx)
// - Wrap return with `<AuthGuard permission="COMPANY_CREATE">`

// #### [MODIFY] [CompanyDetailPage.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/company/CompanyDetailPage.jsx)
// - Wrap return with `<AuthGuard permission="COMPANY_VIEW">`
// - "Edit" action button: already guarded with `can("COMPANY_UPDATE")` ✅
// - Add `can("COMPANY_DELETE")` guard around delete button.

// #### [MODIFY] [CompanyEditForm.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/company/CompanyEditForm.jsx)
// - Wrap return with `<AuthGuard permission="COMPANY_UPDATE">`

// #### [MODIFY] [CompanyListCard.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/company/CompanyListCard.jsx) + [CompanyGridCard.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/company/CompanyGridCard.jsx)
// - Wrap Edit buttons with `can("COMPANY_UPDATE")`.
// - Wrap Delete buttons with `can("COMPANY_DELETE")`.

// ---

// ### 4. Group Module

// #### [MODIFY] [GroupListPage.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/group/GroupListPage.jsx)
// - Replace existing `if (!can("GROUP_VIEW"))` check with `<AuthGuard permission="GROUP_LIST">`
// - "Add Group" button: already guarded with `can("GROUP_CREATE")` ✅

// #### [MODIFY] [GroupDetailPage.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/group/GroupDetailPage.jsx)
// - Wrap return with `<AuthGuard permission="GROUP_VIEW">`

// #### [MODIFY] [group/add/page.js](file:///var/www/html/training/erp/erp-frontend/src/app/(home)/group/add/page.js) (Already client side)
// - Replace inline text with `<AuthGuard permission="GROUP_CREATE">` wrapping the form.

// #### [MODIFY] [group/edit/[id]/page.js](file:///var/www/html/training/erp/erp-frontend/src/app/(home)/group/edit/%5Bid%5D/page.js) (Already client side)
// - Replace inline text with `<AuthGuard permission="GROUP_UPDATE">` wrapping the form.

// #### [MODIFY] [GroupListCard.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/group/GroupListCard.jsx) + [GroupGridCard.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/group/GroupGridCard.jsx)
// - Already guards Edit with `can("GROUP_UPDATE")` ✅
// - Already guards Delete with `can("GROUP_DELETE")` ✅

// ---

// ### 5. User (Admin) Module

// #### [MODIFY] [UserListPage.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/user/UserListPage.jsx)
// - Wrap return with `<AuthGuard permission="USER_LIST">`
// - "Add User" button: already guarded with `can("USER_CREATE")` ✅

// #### [MODIFY] [UserDetailPage.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/user/UserDetailPage.jsx)
// - Wrap return with `<AuthGuard permission="USER_VIEW">`
// - "Edit" button: already guarded with `can("USER_UPDATE")` ✅
// - Wrap Delete button with `can("USER_DELETE")`.

// #### [MODIFY] [admin/add/page.js](file:///var/www/html/training/erp/erp-frontend/src/app/(home)/admin/add/page.js) (Already client side)
// - Wrap return with `<AuthGuard permission="USER_CREATE">`

// #### [MODIFY] [admin/edit/[id]/page.js](file:///var/www/html/training/erp/erp-frontend/src/app/(home)/admin/edit/%5Bid%5D/page.js) (Already client side)
// - Wrap return with `<AuthGuard permission="USER_UPDATE">`

// #### [MODIFY] [UserListCard.jsx + UserGridCard.jsx]
// - Wrap Edit buttons with `can("USER_UPDATE")`.
// - Wrap Delete buttons with `can("USER_DELETE")`.

// ---

// ### 6. Marketing & Sales Modules

// > [!NOTE]
// > Marketing and Sales exist as capabilities in the DB but currently have no frontend pages. No frontend page changes needed for these modules. Guards will be added if/when pages are created.

// ---

// ### 7. Bug Fix — CompanyForm Discard Button

// #### [MODIFY] [CompanyForm.jsx](file:///var/www/html/training/erp/erp-frontend/src/components/company/CompanyForm.jsx)

// **Bug (line 797):** The Discard button's `onClick` contains `() => router.back()` — an arrow function that's defined but never called. The button does nothing when clicked.

// ```diff
// - onClick={() => {
// -   reset(mergedDefaults);
// -   ...
// -   () => router.back();   // ← BUG: function is defined, not called
// - }}
// + onClick={() => {
// +   reset(mergedDefaults);
// +   ...
// +   router.back();         // ← FIX: call the function
// + }}
// ```

// ---

// ## Verification Plan

// ### Manual Verification
// 1. Log in as a user with only `COMPANY_LIST` — verify they see the Company sitemap card and listing page, but NOT the detail page or add/edit pages.
// 2. Log in as a user with only `COMPANY_VIEW` — verify they can open the detail page directly by URL but the listing page redirects to 403.
// 3. Log in as a user with `COMPANY_CREATE` — verify the "Add Company" button appears and the `/company/add` page is accessible.
// 4. Log in as a user WITHOUT `COMPANY_UPDATE` — verify the Edit button is hidden in both list and detail views.
// 5. Log in as a user WITHOUT `COMPANY_DELETE` — verify the Delete button is hidden.
// 6. Log in as SuperAdmin — verify all pages and buttons are accessible.
// 7. Test that navigating directly to a guarded URL redirects to `/not-authorized`.
// 8. Test CompanyForm Discard button navigates back.




// # Config-Driven Listing Architecture — Implementation Plan

//   ## Goal
//   Reduce the massive boilerplate (300+ lines) in our listing pages (`CompanyListPage`, `GroupListPage`, etc.) by moving declarative structure (columns, search fields, filters) into a separate configuration file, while keeping the UI flexible enough for custom rendering.

//   ---

//   ## Best Practice Recommendation

//   The best practice for this pattern is to use a **JavaScript Configuration File (`.config.js`)** rather than a pure `.json` file. 

//   **Why JS over JSON?**
//   1. You can import constants (like dropdown options) directly into the config.
//   2. It stays declarative (looks like JSON) but integrates natively with your React ecosystem.
//   3. You keep the custom rendering logic (`renderCell`) inside your React component where it has access to hooks like `useRouter()`.

//   ### The Separation of Concerns
//   | What goes in `config.js` | What stays in `ListPage.jsx` |
//   |---|---|
//   | 📋 Table headers (keys & labels) | 🎨 Custom cell rendering (`renderCell`) |
//   | 🔍 Search drawer fields & types | 🌐 API fetch function (`listCompanies`) |
//   | 🎛️ Sidebar filter fields | 🧩 Card rendering (`renderGridCard`) |
//   | 🔐 Permissions required | |

// ---

// ## Proposed Implementation

// ### 1. Create the Config File
// We will create a central or module-specific config file.

// **Example: `src/config/company.listing.js`**
// ```javascript
// export const companyListingConfig = {
//   // Page Metadata
//   title: "Company Master",
//   permissions: {
//     list: "COMPANY_LIST",
//     create: "COMPANY_CREATE"
//   },
  
//   // Table Columns
//   headers: [
//     { label: "Logo", key: "logoUrl" },
//     { label: "Company Name", key: "companyName" },
//     { label: "Company Code", key: "companyCode" },
//     { label: "Contact Person", key: "contactPersonName" },
//     { label: "Email", key: "email" },
//     { label: "Phone", key: "phone" },
//     { label: "Status", key: "status" },
//     { label: "Added Date", key: "addedDateFormatted" },
//   ],

//   // Search Drawer Fields
//   searchFields: [
//     { label: "Company Name", value: "companyName", type: "text" },
//     { label: "Company Code", value: "companyCode", type: "text" },
//     { label: "Status", value: "status", type: "select", options: [
//       { label: "Active", value: "Active" },
//       { label: "Inactive", value: "Inactive" },
//     ]}
//   ],

//   // Default Sidebar Filters
//   defaultFilters: {
//     companyName: "",
//     companyCode: "",
//     status: "",
//   }
// };
// ```

// ### 2. Refactor the Generic `ListingPage` Wrapper
// Currently, `CompanyListPage` manages all the state for search, filters, pagination, and fetching.
// We can upgrade our generic `ListingPage` component to accept the config and handle all this internally.

// ```jsx
// // How CompanyListPage will look after refactoring:
// export default function CompanyListPage() {
//   const router = useRouter();

//   // Custom rendering logic stays here (has access to router)
//   const renderCell = (item, key) => {
//     if (key === "companyName") {
//       return <a onClick={() => router.push(`/company/${item.id}`)}>{item.companyName}</a>;
//     }
//     // ...
//   };

//   return (
  //     <DynamicListing
  //       config={companyListingConfig}
  //       fetchData={listCompanies}
  //       renderCell={renderCell}
  //       renderListCard={(c) => <CompanyListCard company={c} />}
  //       renderGridCard={(c) => <CompanyGridCard company={c} />}
  //     />
//   );
// }
// ```

// ### 3. Benefits of this Approach
// 1. **Massive Code Reduction**: `CompanyListPage.jsx` will drop from ~310 lines to ~50 lines.
// 2. **Consistency**: All listing pages (Company, Group, User) will behave exactly the same way.
// 3. **Easy Updates**: Adding a new column or search field just requires a 1-line addition to the config file.
// 4. **Developer Friendly**: It balances configuration-driven UI with the flexibility of standard React for the complex bits.

// ---

// ## User Review Required

// Does this architecture align with your vision? Let me know if you approve this plan, or if you'd like to tweak how the configuration is structured before we implement it!














// # Fully Config-Driven UI Architecture Analysis

// ## The Proposal
// The idea is to eliminate passing React components as props (`renderListCard`, `renderGridCard`) and instead define the layout and structure of these cards entirely inside the configuration object. The goal is to have exactly **one** generic `DynamicListing` component that builds the entire UI purely from configuration, allowing us to drop `CompanyListPage.jsx`, `GroupListPage.jsx`, etc. completely.

// ---

// ## Is this the right approach? (Industry Standards)

// This paradigm is known as **Data-Driven UI** or **Server-Driven UI (SDUI)**. It is heavily used in low-code platforms (like Retool), generic admin panels (like React-Admin), and mobile apps that want to update layouts without App Store approvals.

// ### The Verdict: It is a double-edged sword.
// It is an excellent approach for **simple, highly uniform** applications, but it is considered an **anti-pattern** for standard React applications if your UI requires complex, module-specific interactions.

// Here is a breakdown of why:

// ### 🟢 Pros of a Fully Config-Driven Approach
// 1. **Zero Boilerplate:** You don't need a `CompanyListPage.jsx` or `GroupListPage.jsx` at all. You just register a route and pass it a config object.
// 2. **Backend Control:** You can eventually move the config to the backend, meaning you can generate new modules and pages without writing any frontend code.
// 3. **Strict Consistency:** It forces all developers to use the exact same card layouts, preventing design drift.

// ### 🔴 Cons and Risks (The "God Object" Problem)
// 1. **Reinventing React:** React is already a configuration engine for UI. By putting layout into JSON, you have to build an interpreter in `DynamicListing` that reads JSON and outputs React.
// 2. **Handling Actions is Very Hard:** If a specific card needs a custom button (e.g., "Reset Password" on a User card that opens a specific modal), you cannot put a JavaScript function in JSON. You end up having to invent complex event buses or action registries.
// 3. **Complex Layouts:** If one module's card needs a slightly different layout (e.g., an avatar on the left instead of top), your JSON schema becomes exponentially more complicated as you add layout directives.

// ---

// ## What a Fully Config-Driven Implementation Looks Like

// If we proceed with this, here is how the config would need to be structured:

// ```javascript
// // generic.listing.config.js
// export const companyListingConfig = {
//   apiEndpoint: "/company", // Handled internally by generic fetch
//   permissions: { list: "COMPANY_LIST", create: "COMPANY_CREATE" },
  
//   // Table definition
//   columns: [
//     { label: "Company Name", key: "companyName", type: "text" },
//     { label: "Status", key: "status", type: "badge", colors: { Active: "green", Inactive: "red" } }
//   ],

//   // Card Layout Engine Definition
//   cardStructure: {
//     // Defines what shows up in the ListCard / GridCard
//     header: {
//       titleKey: "companyName",
//       subtitleKey: "companyCode",
//       imageKey: "logoUrl"
//     },
//     body: [
//       { label: "Email", key: "email", icon: "Mail" },
//       { label: "Phone", key: "phone", icon: "Phone" }
//     ],
//     footerActions: [
//       { type: "edit", permission: "COMPANY_UPDATE" },
//       { type: "delete", permission: "COMPANY_DELETE" }
//     ]
//   }
// }
// ```

// ### The Universal Component

// We would then have a single `app/(home)/[module]/page.js` that loads the config dynamically based on the URL route:

// ```jsx
// import UniversalListing from "@/components/common/UniversalListing";
// import { getListingConfig } from "@/config/registry";

// export default function GenericModulePage({ params }) {
//   const config = getListingConfig(params.module); // gets company, group, etc.
  
//   return <UniversalListing config={config} />;
// }
// ```

// ---

// ## Best Practice Recommendation

// If your goal is to build a standard, maintainable React ERP system, the **Hybrid Approach** is the industry standard:

// 1. **Use Config for Data:** Put columns, filters, API endpoints, and search fields in a config file. (Data is easy to configure).
// 2. **Use React for UI:** Continue passing `<CompanyListCard />` as a prop. (UI is hard to configure).

// **Why?** Because creating a `<CompanyListCard />` component takes maybe 50 lines of easy-to-read HTML/JSX. Building a generic JSON-to-Card rendering engine takes hundreds of lines of complex logic, and breaks as soon as a stakeholder says "Can we make the company logo bigger on this one specific card?".

// ### Decision Time
// - If you want **maximum flexibility** and standard React patterns: Keep passing Card components as props.
// - If you want a **strict, low-code architecture** where all cards must look identical and are driven by config: We can build the Card Structure Engine as outlined above. 

// How would you like to proceed?
