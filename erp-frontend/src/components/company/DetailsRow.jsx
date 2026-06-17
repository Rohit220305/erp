export default function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <span className="text-gray-500">{label}</span>

      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
