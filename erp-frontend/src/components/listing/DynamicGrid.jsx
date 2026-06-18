export default function DynamicGrid({ data, renderCard }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5  overflow-auto max-h-[92%] ">
      {data.map((item, index) => renderCard(item, index))}
    </div>
  );
}
