export default function DynamicTable({ headers, data, renderCell }) {
  console.log("DynamicTable data:", data);
  console.log("DynamicTable headers:", headers);
  console.log("DynamicTable renderCell:", renderCell);
  return (
    <div className="p-2 rounded-xl">
      <table className="w-full">
        <thead>
          <tr className="bg-[#eceaea] text-left">
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-4 font-medium">
                {header.label}
              </th>
            ))}
          </tr>
          <tr className="h-1"></tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={item.id || rowIndex}
              className="border border-gray-200 hover:bg-gray-50"
            >
              {headers.map((header, colIndex) => (
                <td key={colIndex} className="px-4 py-4">
                  {renderCell ? renderCell(item, header.key) : item[header.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* pegination and other controls can be added here */}
      {/* <div
        className={` w-full bg-white  flex justify-center items-center py-2 mt-2 z-40`}
      >
        <div className="grid justify-center sm:flex sm:justify-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Show
            </span>
            <select
              value={limit}
              onChange={handleLimitChange}
              className="min-h-10 p-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-black outline-none"
            >
              <option value={2}>2</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              of {totalEntries}
            </span>
          </div>

          <nav
            className="flex justify-end items-center -space-x-px"
            aria-label="Pagination"
          >
            <button
              type="button"
              disabled={prev == 0}
              onClick={() => setPageIndex((p) => 1)}
              className="p-3 inline-flex justify-center items-center gap-x-1.5 text-sm first:rounded-s-lg last:rounded-e-lg border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              type="button"
              disabled={prev == 0}
              onClick={() => setPageIndex((p) => p - 1)}
              className="p-3 inline-flex justify-center items-center gap-x-1.5 text-sm first:rounded-s-lg last:rounded-e-lg border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {getPages(pageIndex, total).map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="min-h-11 min-w-11 flex justify-center items-center border border-gray-200 py-2 px-4"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`${page}-${idx}`}
                  onClick={() => setPageIndex(page)}
                  className={`min-h-11 min-w-11 flex justify-center items-center border border-gray-200 py-2 px-4 text-sm focus:outline-none transition-all cursor-pointer ${
                    pageIndex === page
                      ? "bg-black text-white"
                      : "bg-white text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={next == 0}
              onClick={() => setPageIndex((p) => p + 1)}
              className="p-3 inline-flex justify-center items-center gap-x-1.5 text-sm first:rounded-s-lg last:rounded-e-lg border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              disabled={next == 0}
              onClick={() => setPageIndex((p) => total)}
              className="p-3 inline-flex justify-center items-center gap-x-1.5 text-sm first:rounded-s-lg last:rounded-e-lg border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronsRight size={16} />
            </button>
          </nav>

          <div className="flex items-center gap-x-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Go to
            </span>
            <input
              type="number"
              min="1"
              max={total}
              onKeyUp={handleGoToPage}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-h-10 p-2 block w-12 bg-white border border-gray-200 rounded-lg text-sm text-center text-gray-800 focus:border-black focus:ring-black outline-none"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">
              page
            </span>
          </div>
        </div>
      </div> */}
    </div>
  );
}
