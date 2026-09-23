import { Suspense } from "react";
import { getProcessTemplate } from "@/lib/api/process-template-api";
import ProcessTemplateDetailPage from "@/components/process-template/ProcessTemplateDetailPage";
import Loader from "@/components/common/Loader";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getProcessTemplate({ id });
    if (res?.success === 0 && res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.data || res?.settings?.data;
    if (!data) return notFound();
    return (
      <Suspense fallback={<Loader fullPage />}>
        <ProcessTemplateDetailPage data={data} />
      </Suspense>
    );
  } catch (error) {
    return notFound();
  }
}
