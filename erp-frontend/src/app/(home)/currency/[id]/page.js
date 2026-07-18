import { notFound } from "next/navigation";
import CurrencyDetailPage from "@/components/currency/CurrencyDetailPage";
import { getCurrency } from "@/lib/api/currency-api";

export default async function Page({ params }) {
  params = await params;
  const response = await getCurrency({ id: params.id });
  if (!response || response.settings.success === 0 || !response.settings  .data) {
     return notFound();
  }

  return <CurrencyDetailPage currency={response?.settings?.data} />;
}
