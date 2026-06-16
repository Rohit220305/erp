import CompanyDetailsPage from "@/components/company/CompanyDetailPage";
import { getCompany } from "@/lib/api/company-api";

export default async function Page({ params }) {
    params = await params; 
    console.log("Company ID from params:", params.id); 
    const company = await getCompany(params.id);

  return <CompanyDetailsPage company={company} />;
}   
