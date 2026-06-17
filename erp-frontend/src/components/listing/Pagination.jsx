"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

function getPages(current, total) {
  // show all pages for small totals
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];

  let start = current - 1;
  let end = current + 1;

  // fix left boundary
  if (start < 1) {
    start = 1;
    end = 3;
  }

  // fix right boundary
  if (end > total) {
    end = total;
    start = total - 2;
  }

  // first page + ellipsis
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("...");
  }

  // middle range
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // ellipsis + last page
  if (end < total) {
    if (end < total - 1) pages.push("...");
    pages.push(total);
  }

  return pages;
}

export default function Pagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}) {
  const totalPages = Math.ceil(total / limit) || 1;

  // Range info: "Showing 1–10 of 42 entries" (graceful when total is 0)
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * limit, total);

  const handleGoToPage = (e) => {
    if (e.key === "Enter") {
      const val = parseInt(e.target.value, 10);
      if (val >= 1 && val <= totalPages) onPageChange(val);
      e.target.value = "";
    }
  };


  const navBtnBase =
    "h-9 w-9 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-150 cursor-pointer";
  const navBtnEnabled =
    "text-gray-500 hover:bg-[#1565c0]/10 hover:text-[#1565c0]";
  const navBtnDisabled = "text-gray-300 cursor-not-allowed";

  return (
    <div className="sticky bottom-0 z-30 w-full  bg-white/95 backdrop-blur-sm flex flex-wrap items-center justify-between px-5 py-3 gap-4 border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      {/* Left: Show N + range info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 whitespace-nowrap">Show</span>
          <select
            value={limit}
            onChange={(e) => {
              onLimitChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="h-8 px-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-[#1565c0] focus:ring-1 focus:ring-[#1565c0]/20 outline-none transition cursor-pointer"
          >
            {[2, 5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          Showing{" "}
          <span className="font-semibold text-gray-600">
            {rangeStart}–{rangeEnd}
          </span>{" "}
          of <span className="font-semibold text-gray-600">{total}</span>{" "}
          entries
        </span>
      </div>

      {/* Center: Page buttons */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* First */}
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(1)}
          className={`${navBtnBase} ${page === 1 ? navBtnDisabled : navBtnEnabled}`}
          aria-label="First page"
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Prev */}
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`${navBtnBase} ${page === 1 ? navBtnDisabled : navBtnEnabled}`}
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {getPages(page, totalPages).map((p, idx) =>
          p === "..." ? (
            <span
              key={`e-${idx}`}
              className="h-9 w-9 flex items-center justify-center text-sm text-gray-400"
            >
              ···
            </span>
          ) : (
            <button
              key={`${p}-${idx}`}
              type="button"
              onClick={() => onPageChange(p)}
              className={`${navBtnBase} text-sm font-semibold ${
                page === p
                  ? "bg-[#1565c0] text-white shadow-md shadow-[#1565c0]/30 ring-2 ring-[#1565c0]/20"
                  : "text-gray-600 hover:bg-[#1565c0]/10 hover:text-[#1565c0]"
              }`}
            >
              {p}
            </button>
          ),
        )}

        {/* Next */}
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`${navBtnBase} ${page === totalPages ? navBtnDisabled : navBtnEnabled}`}
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>

        {/* Last */}
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`${navBtnBase} ${page === totalPages ? navBtnDisabled : navBtnEnabled}`}
          aria-label="Last page"
        >
          <ChevronsRight size={15} />
        </button>
      </nav>

      {/* Right: Go to page */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 whitespace-nowrap">Go to</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          onKeyUp={handleGoToPage}
          placeholder={String(page)}
          className="h-8 w-14 text-center bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-[#1565c0] focus:ring-1 focus:ring-[#1565c0]/20 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-xs text-gray-400">page</span>
      </div>
    </div>
  );
}
