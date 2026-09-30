export default function DetailRow({ label, value, valueNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 items-center">
      <span className="text-gray-500">{label}</span>

      <span className="font-medium text-right">{valueNode ? valueNode : value}</span>
    </div>
  );
}
