import DynamicTable from "./DynamicTable";
import DynamicGrid from "./DynamicGrid";
import DynamicList from "./DynamicList";

export default function ListingPage({
  view,
  data,
  headers,
  renderCell,
  renderListCard,
  renderGridCard,
}) {
  if (view === "table") {
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        <DynamicTable
          headers={headers}
          data={data}
          renderCell={renderCell}
        />
      </div>
    );
  }

  if (view === "list") {
    return <DynamicList data={data} renderCard={renderListCard} />;
  }

  return <DynamicGrid data={data} renderCard={renderGridCard} />;
}
