import { useListing } from "@/context/ListingContext";

export default function useListingView() {
  const { view, setView } = useListing();

  return {
    view,
    setView,
  };
}
