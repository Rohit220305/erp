"use client";

import { useEffect, useState } from "react";

import ListingPage from "@/components/listing/ListingPage";



import { getCompanies } from "@/lib/api/api";
import { useHeader } from "@/context/HeaderContext";
import CompanyTableRow from "./CompanyTableRow";
import CompanyListCard from "./CompanyListCard";
import CompanyGridCard from "./CompanyGridCard";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";
import CompanyTable from "./CompanyTable";

export default function CompanyListPage() {
  const { setConfig, resetConfig } = useHeader();

  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { view } = useListing();
  const fetchCompanies = async () => {
    try {
      setLoading(true);

      const response = await getCompanies();
      console.log("Fetched Companies:", response.settings.data.list);
      setCompanies(response?.settings?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  
    useEffect(() => {
    setConfig({
      header: {
        actionButton: {
          label: "Add Company",
          onClick: () => router.push("/companies/add"),
        },
        icons: ["refresh", "filter", "view"],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
      },
      navbar: {
        title: "Listing",
        breadcrumbs: [
          {
            label: "Master",
          },
          {
            label: "Company Master",
            href: "/company",
          },
        ],
      },
    });
    
    fetchCompanies();
    
    return () => {
      resetConfig();
    };
  }, []);

  if (loading) {
    return <div className="p-6">Loading Companies...</div>;
  }

  return (
    <div className="px-6">
      <ListingPage
        view={view}
        data={companies.list}
        table={<CompanyTable data={companies.list} />}
        // renderTableRow={(company) => (
        //   <CompanyTableRow key={company.id} company={company} />
        // )}
        renderListCard={(company) => (
          <CompanyListCard key={company.id} company={company} />
        )}
        renderGridCard={(company) => (
          <CompanyGridCard key={company.id} company={company} />
        )}
      />
    </div>
  );
}