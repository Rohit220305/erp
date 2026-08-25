import { getProcessTemplate } from "@/lib/api/process-template-api";
import ProcessTemplateDetailPage from "@/components/process-template/ProcessTemplateDetailPage";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await getProcessTemplate({ id });
    const templateName = res?.data?.templateName || res?.settings?.data?.templateName;
    if (templateName) {
      return { title: `${templateName} | Process Template` };
    }
  } catch (error) {
    // 
  }
  return { title: "Process Template Details" };
}

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getProcessTemplate({ id });
    if (res?.success === 0 && res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.data || res?.settings?.data;
    if (!data) return notFound();
    return <ProcessTemplateDetailPage data={data} />;
  } catch (error) {
    return notFound();
  }
}
