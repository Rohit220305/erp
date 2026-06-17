import { notFound } from "next/navigation";
import { getCompany, listCompanies } from "@/lib/api/company-api";
import CompanyEditForm from "@/components/company/CompanyEditForm";
import EditCompanyHeader from "@/components/company/EditCompanyHeader";

export default async function CompanyEditPage({ params }) {
  params = await params;

  const [company, companiesRes] = await Promise.all([
    getCompany(params.id),
    listCompanies({ page: 1, limit: 100, search: "" }),
  ]);

  if (!company) {
    notFound();
  }

  const allCompanies = companiesRes?.settings?.data?.list ||
    companiesRes?.data?.list || [];

  // Exclude self from parent options
  const parentCompanies = allCompanies.filter((c) => c.id !== company.id);

  return (
    <div className="p-6">
      <EditCompanyHeader company={company} />
      <CompanyEditForm company={company} parentCompanies={parentCompanies} />
    </div>
  );
}
