"use client";

import Masonry from "react-masonry-css";
import SitemapCard from "./SitemapCard";
import { useAuth } from "@/context/AuthContext";

export default function SitemapGrid({ data }) {
  const { can, user } = useAuth();
  const breakpointColumnsObj = {
    default: 4,
    1280: 4,
    1024: 3,
    768: 2,
    640: 1,
  };

  const filteredData = data
    .map((section) => {
      if (section.superAdminOnly && !user?.isSuperAdmin) {
        return null;
      }
      
      if (section.permission && !can(section.permission)) {
        return null;
      }

      const filteredMenus = section.menus.filter((menu) => {
        if (menu.superAdminOnly && !user?.isSuperAdmin) {
          return false;
        }
        if (menu.permission && !can(menu.permission)) {
          return false;
        }
        return true;
      });

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

