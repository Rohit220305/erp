import { notFound } from "next/navigation";
import CompanyDetailsPage from "@/components/company/CompanyDetailPage";
import { getCompany } from "@/lib/api/company-api";

export default async function Page({ params }) {
  params = await params;

  const company = await getCompany(params.id);


  return <CompanyDetailsPage company={company} />;
}


