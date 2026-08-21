import WorkCentreForm from "@/components/work-centre/WorkCentreForm";

export const metadata = {
  title: "Add Work Centre"
};

export default function AddWorkCentrePage() {
  return <WorkCentreForm mode="create" />;
}
