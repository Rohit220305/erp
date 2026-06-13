export default function ListView({ data, renderCard }) {
  return (
    <div className="space-y-4">{data.map((item) => renderCard(item))}</div>
  );
}
