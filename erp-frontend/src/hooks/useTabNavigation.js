"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

const STORAGE_PREFIX = "erp_active_tab_";

export function useTabNavigation({
  moduleKey,
  entityId,
  defaultTab = "summary",
  validTabs = [],
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const storageKey = entityId
    ? `${STORAGE_PREFIX}${moduleKey}_${entityId}`
    : `${STORAGE_PREFIX}${moduleKey}`;

  // Determine active tab by checking: URL query param -> sessionStorage -> defaultTab
  const activeTab = useMemo(() => {
    const fromUrl = searchParams.get("tab");
    if (fromUrl && (validTabs.length === 0 || validTabs.includes(fromUrl))) {
      return fromUrl;
    }

    if (typeof window !== "undefined") {
      const fromStorage = sessionStorage.getItem(storageKey);
      if (
        fromStorage &&
        (validTabs.length === 0 || validTabs.includes(fromStorage))
      ) {
        return fromStorage;
      }
    }

    return defaultTab;
  }, [searchParams, storageKey, defaultTab, validTabs]);

  // Sync state to sessionStorage whenever activeTab changes
  useEffect(() => {
    if (typeof window !== "undefined" && activeTab) {
      sessionStorage.setItem(storageKey, activeTab);
    }
  }, [storageKey, activeTab]);

  // Generate href string for a given tab slug
  const getTabHref = useCallback(
    (tabSlug) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabSlug);
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams]
  );

  // Update active tab programmatically (URL + sessionStorage)
  const setActiveTab = useCallback(
    (tabSlug) => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(storageKey, tabSlug);
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabSlug);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, searchParams, router, storageKey]
  );

  return { activeTab, setActiveTab, getTabHref };
}

export default useTabNavigation;
