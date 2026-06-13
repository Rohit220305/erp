export default function GridView({ data, renderCard }) {
  return (
    <div
      className="
      grid
      grid-cols-1
      md:grid-cols-2
      xl:grid-cols-4
      gap-5
    "
    >
      {data.map((item) => renderCard(item))}
    </div>
  );
}
