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
