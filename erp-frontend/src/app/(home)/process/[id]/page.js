import { getProcess } from "@/lib/api/process-api";
import ProcessDetailPage from "@/components/process/ProcessDetailPage";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await getProcess({ id });
    const processName = res?.data?.processName || res?.settings?.data?.processName;
    if (processName) {
      return { title: `${processName} | Process` };
    }
  } catch (error) {
    //
  }
  return { title: "Process Details" };
}

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getProcess({ id });
    if (res?.success === 0 && res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.data || res?.settings?.data;
    if (!data) return notFound();
    return <ProcessDetailPage data={data} />;
  } catch (error) {
    return notFound();
  }
}
