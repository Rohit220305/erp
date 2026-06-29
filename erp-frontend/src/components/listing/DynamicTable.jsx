export default function DynamicTable({
  headers,
  data,
  renderCell,
  maxHeight = "500px",
}) {
  if (!data || data.length === 0) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">
        No records found.
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-[92%]">
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-4 text-left font-medium text-sm"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody >
          {data.map((item, rowIndex) => (
            <tr
              key={item.id || rowIndex}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              {headers.map((header, colIndex) => (
                <td key={colIndex} className="px-4 py-3 text-sm">
                  {renderCell ? renderCell(item, header.key) : item[header.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


