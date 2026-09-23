"use client";

import Link from "next/link";
import { buildRoute } from "@/lib/navigation/routeBuilder";


export default function ModuleLink({
  href: hrefProp,
  onClick: onClickProp,
  moduleName,
  action = "detail",
  params,
  id,
  tab,
  onOpenDrawer,
  children,
  className = "",
  prefetch = false,
  ...rest
}) {
  let computedHref = "#";

  if (hrefProp) {
    computedHref = hrefProp;
  } else if (moduleName) {
    try {
      const mergedParams = {
        ...(id !== undefined && id !== null ? { id } : {}),
        ...(params || {}),
        ...(tab ? { tab } : {}),
      };
      computedHref = buildRoute(moduleName, action, mergedParams);
    } catch (err) {
      console.warn(
        `[ModuleLink] Could not build route for module "${moduleName}", action "${action}":`,
        err?.message
      );
      computedHref = "#";
    }
  }

  const handleClick = (e) => {
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      return;
    }

    if (onClickProp) {
      e.preventDefault();
      onClickProp(e);
    } else if (onOpenDrawer) {
      e.preventDefault();
      const targetId = id !== undefined && id !== null ? id : (params?.id || params);
      onOpenDrawer(moduleName, targetId, e);
    }
  };

  return (
    <Link
      href={computedHref}
      onClick={handleClick}
      prefetch={prefetch}
      className={`text-[#1565c0] hover:underline font-medium cursor-pointer ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
