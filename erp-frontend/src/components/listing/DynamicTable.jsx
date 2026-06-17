export default function DynamicTable({ headers, data, renderCell }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">
        No records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className=" bg-gray-50 border-b border-gray-200">
          <tr className="bg-white text-left ">
            {headers.map((header, index) => (
              <th
                key={index}
                className=" px-4 py-4 font-medium text-sm whitespace-nowrap"
              >
                {header.label}
              </th>
            ))}
          </tr>
          <tr className="h-1" />
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={item.id || rowIndex}
              className="border-b border-gray-100 hover:bg-gray-50 transition"
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
