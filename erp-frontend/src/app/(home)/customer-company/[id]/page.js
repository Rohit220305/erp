import { getCustomerCompany } from "@/lib/api/customer-company-api";
import CustomerCompanyDetailPage from "@/components/customer-company/CustomerCompanyDetailPage";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getCustomerCompany({ id });
    if (res?.success === 0 || res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.settings?.data || res?.data;
    if (!data) return notFound();
    return <CustomerCompanyDetailPage id={id} initialData={data} />;
  } catch (error) {
    return notFound();
  }
}
