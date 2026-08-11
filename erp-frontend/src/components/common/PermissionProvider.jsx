"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { routePermissions } from "@/config/routePermissions";
import AccessDenied from "./AccessDenied";
import { useEffect, useState } from "react";

export default function PermissionProvider({ children }) {
  const pathname = usePathname();
  const { can, isInitializing } = useAuth();
  const [hasPermission, setHasPermission] = useState(true);
  const [missingCap, setMissingCap] = useState(null);

  useEffect(() => {
    if (isInitializing) return;

    let requiredCap = null;
    for (const route of routePermissions) {
      if (route.pattern.test(pathname)) {
        requiredCap = route.capability;
        break;
      }
    }

    if (requiredCap && !can(requiredCap)) {
      setHasPermission(false);
      setMissingCap(requiredCap);
    } else {
      setHasPermission(true);
      setMissingCap(null);
    }
  }, [pathname, can, isInitializing]);

  if (isInitializing) {
    return null; 
  }

  if (!hasPermission) {
    return <AccessDenied missingPermission={missingCap} />;
  }

  return children;
}
