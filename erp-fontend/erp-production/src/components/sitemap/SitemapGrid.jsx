"use client";

import Masonry from "react-masonry-css";
import SitemapCard from "./SitemapCard";

export default function SitemapGrid({ data }) {
  const breakpointColumnsObj = {
    default: 4,
    1280: 4,
    1024: 3,
    768: 2,
    640: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex gap-5"
      columnClassName="space-y-5"
    >
      {data.map((section) => (
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
