import { notFound } from "next/navigation";
import CompanyDetailsPage from "@/components/company/CompanyDetailPage";
import { getCompany } from "@/lib/api/company-api";

export default async function Page({ params }) {
  params = await params;

  const company = await getCompany(params.id);

  // getCompany() returns null when the API errors or the record doesn't exist.
  // Render 404 instead of crashing CompanyDetailsPage with a null prop.
  

  return <CompanyDetailsPage company={company} />;
}


