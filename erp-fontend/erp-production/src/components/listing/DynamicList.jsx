export default function DynamicList({ data, renderCard }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">
        No records found.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {data.map((item, index) => renderCard(item, index))}
    </div>
  );
}
