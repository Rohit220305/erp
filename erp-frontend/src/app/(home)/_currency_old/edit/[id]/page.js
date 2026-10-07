import CurrencyEditWrapper from "@/components/currency/CurrencyEditWrapper";

export default async function CurrencyEditPage({ params }) {
  params = await params;
  return <CurrencyEditWrapper id={params.id} />;
}
