import DynamicTable from "./DynamicTable";
import DynamicGrid from "./DynamicGrid";
import DynamicList from "./DynamicList";
import Pagination from "./Pagination";
import { useListing } from "@/context/ListingContext";

export default function ListingPage({
  view,
  data,
  headers,
  renderCell,
  renderListCard,
  renderGridCard,
  loading,
}) {
  const { page, setPage, limit, setLimit, total } = useListing();
  const paginationProps = {
    page,
    limit,
    total,
    onPageChange: setPage,
    onLimitChange: setLimit,
  };

  if (view === "table") {
    return (
      <div className="bg-white rounded-lg overflow-hidden h-full">
        <DynamicTable headers={headers} data={data} renderCell={renderCell} loading={loading} />

        <div className="absolute bottom-0 left-0 right-0 mx-6">
          <Pagination {...paginationProps} />
        </div>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="bg-white rounded-lg overflow-hidden h-full">
        <DynamicList data={data} renderCard={renderListCard} />
        <div className="absolute bottom-0 left-0 right-0 mx-6">
          <Pagination {...paginationProps} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden h-full">
      <DynamicGrid data={data} renderCard={renderGridCard} />
      <div className="absolute bottom-0 left-0 right-0 mx-6">
        <Pagination {...paginationProps} />
      </div>
    </div>
  );
}

