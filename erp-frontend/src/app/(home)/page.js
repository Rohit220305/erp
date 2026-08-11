"use client";

import { useEffect } from "react";

import SitemapGrid from "@/components/sitemap/SitemapGrid";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";

import { sitemapData } from "@/lib/sitemap/sitemap-data";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import Loader from "@/components/common/Loader";

export default function HomePage() {
  const { setConfig, resetConfig } = useHeader();
  const { execute, isLoading } = useAsyncAction();

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
  }, [setConfig, resetConfig]);

  useEffect(() => {
    execute(async () => {});
  }, [execute]);

  if (isLoading) {
    return <Loader fullPage />;
  }

  return (
    <div className="p-4">
      <SitemapGrid data={sitemapData} />
    </div>
  );
}
