"use client";

import Masonry from "react-masonry-css";
import SitemapCard from "./SitemapCard";
import { useAuth } from "@/context/AuthContext";

export default function SitemapGrid({ data }) {
  const { can } = useAuth();

  const breakpointColumnsObj = {
    default: 4,
    1280: 4,
    1024: 3,
    768: 2,
    640: 1,
  };

  // Filter sections and menus based on permissions
  const filteredData = data
    .map((section) => {
      // If the section itself requires a permission and user does not have it, return null
      if (section.permission && !can(section.permission)) {
        return null;
      }

      // Filter menus in this section
      const filteredMenus = section.menus.filter((menu) => {
        if (menu.permission && !can(menu.permission)) {
          return false;
        }
        return true;
      });

      // If no menus are left in the section, don't show the section card
      if (filteredMenus.length === 0) {
        return null;
      }

      return {
        ...section,
        menus: filteredMenus,
      };
    })
    .filter(Boolean);

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex gap-5"
      columnClassName="space-y-5"
    >
      {filteredData.map((section) => (
        <SitemapCard
          key={section.title}
          title={section.title}
          menus={section.menus}
          path={section.path}
        />
      ))}
    </Masonry>
  );
}

