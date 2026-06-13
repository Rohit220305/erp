"use client";

import { useState } from "react";

import { Rows3, LayoutGrid, TableProperties } from "lucide-react";

import { useListing } from "@/context/ListingContext";

export default function ViewSwitcher() {
  const [open, setOpen] = useState(false);

  const { view, setView } = useListing();

  const options = [
    {
      label: "Table View",
      value: "table",
      icon: <TableProperties size={18} />,
    },
    {
      label: "List View",
      value: "list",
      icon: <Rows3 size={18} />,
    },
    {
      label: "Grid View",
      value: "grid",
      icon: <LayoutGrid size={18} />,
    },
  ];

  const selectedOption =
    options.find((item) => item.value === view) || options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex
          items-center
          gap-2
          cursor-pointer
          text-gray-600
          hover:text-blue-600
          transition
        "
      >
        {selectedOption.icon}

      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 " onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div
            className="
              absolute
              right-0
              top-full
              mt-4
              w-56
              bg-white
              border
              border-gray-200
              rounded-lg
              shadow-xl
              z-50
              overflow-hidden
            "
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setView(option.value);
                  setOpen(false);
                }}
                className={`
                  flex
                  items-center
                  justify-between
                  w-full
                  px-4
                  py-3
                  text-left
                  transition
                  hover:bg-gray-50
                  cursor-pointer
                  ${view === option.value ? "bg-blue-50 text-blue-600" : ""}
                `}
              >
                <span>{option.label}</span>

                {option.icon}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
