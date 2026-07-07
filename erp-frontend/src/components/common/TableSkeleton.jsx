"use client";


function seededWidth(row, col) {
  const n = Math.sin(row * 127 + col * 311) * 43758.5453123;
  return 60 + (n - Math.floor(n)) * 40; // range [60, 100)
}

export default function TableSkeleton({ rows = 8, cols = 5 }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#eceaea]">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-4">
                  <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
                </th>
              ))}
            </tr>
            <tr className="h-1" />
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-100">
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-4">
                    <div
                      className="h-4 bg-gray-200 rounded animate-pulse"
                      style={{ width: `${seededWidth(rowIdx, colIdx).toFixed(4)}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
