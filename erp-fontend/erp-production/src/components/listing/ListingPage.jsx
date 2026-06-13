import TableView from "./TableView";
import ListView from "./ListView";
import GridView from "./GridView";

export default function ListingPage({
  view,
  data,
  renderTableRow,
  renderListCard,
  renderGridCard,

  table,
}) {
  if (view === "table") {
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        {table}
        {/* <TableView data={data}  /> */}
      </div>
    );
  }

  if (view === "list") {
    return <ListView data={data} renderCard={renderListCard} />;
  }

  return <GridView data={data} renderCard={renderGridCard} />;
}
