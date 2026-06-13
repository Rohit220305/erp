"use client";

import { useEffect } from "react";

import SitemapGrid from "@/components/sitemap/SitemapGrid";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";

import { sitemapData } from "@/lib/sitemap/sitemap-data";

export default function HomePage() {

  const { setConfig, resetConfig } = useHeader();

  useEffect(() => {
    setConfig({
      header: {
        actionButton: null,
        icons: [],

        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
      },

      navbar: {
        title: "Welcome To Production Planning",
        breadcrumbs: [],
      },
    });

    return () => {
      resetConfig();
    };
  }, []);

  return (
    <div className="p-4">
      <SitemapGrid data={sitemapData} />
    </div>
  );
}
