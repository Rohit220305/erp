"use client";

import { useEffect, useState } from "react";

import ListingPage from "@/components/listing/ListingPage";
import {  listCompanies } from "@/lib/api/company-api";
import { useHeader } from "@/context/HeaderContext";
import CompanyListCard from "./CompanyListCard";
import CompanyGridCard from "./CompanyGridCard";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";

export default function CompanyListPage() {
  const { setConfig, resetConfig } = useHeader();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { view } = useListing();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await listCompanies();
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
          onClick: () => router.push("/company/add"),
        },
        icons: ["refresh", "filter", "view"],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
        showSearch: true,
      },
      navbar: {
        title: "Listing",
        breadcrumbs: [
          { label: "Master" },
          { label: "Company Master", href: "/company" },
        ],
      },
    });

    fetchCompanies();

    return () => {
      resetConfig();
    };
  }, []);

  const headers = [
    { label: "Logo", key: "logoUrl" },
    { label: "Company Name", key: "companyName" },
    { label: "Company Code", key: "companyCode" },
    { label: "Contact Person", key: "contactPersonName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Status", key: "status" },
    { label: "Added Date", key: "addedDateFormatted" },
  ];

  const handleClick = (companyId) => {
    router.push(`/company/${companyId}`);
  }

  const renderCell = (item, key) => {
    if (key === "logoUrl") {
      return item.logoUrl ? (
        <img
          src={item.logoUrl}
          alt={item.companyName}
          className="h-10 w-10 rounded object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded bg-gray-200" />
      );
    }


    if (key === "companyName") {
      return (
        <div>
          <p className="font-medium hover:cursor-pointer text-blue-600 hover:underline " onClick={() => handleClick(item.id)}>{item.companyName || "-"}</p>
          {/* <p className="text-xs text-gray-500">{item.shortName || "-"}</p> */}
        </div>
      );
    }

    if (key === "status") {
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            item.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.status || "-"}
        </span>
      );
    }
    if (key === "phone") {
      return (
        <div>
          <p className="font-medium ">
            <span>
              {item.dialCode }
              {"- "}{" "}
            </span>
            {item.phone }
          </p>
        </div>
      );
    }



    return item[key] || "-";
  };

  if (loading) {
    return <div className="p-6">Loading Companies...</div>;
  }

  return (
    <div className="px-6">
      <ListingPage
        view={view}
        data={companies.list || []}
        headers={headers}
        renderCell={renderCell}
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


const renderCell = (item, key) => {
  // Handle logoUrl
  if (key === "logoUrl") {
    return item.logoUrl ? (
      <img
        src={item.logoUrl}  
        alt={item.companyName}
        className="h-10 w-10 rounded object-cover"
      />
    ) : (
      <div className="h-10 w-10 rounded bg-gray-200" />
    );
  }

  // Handle companyName
  if (key === "companyName") {
    return (
      <div>
        <p className="font-medium">{item.companyName || "-"}</p>
        <p className="text-xs text-gray-500">{item.shortName || "-"}</p>
      </div>
    );
  }

  // Handle status
  if (key === "status") {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs ${
          item.status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {item.status || "-"}
      </span>
    );
  }

  // Default: show "-" if null/undefined/empty
  return item[key] || "-";
};  