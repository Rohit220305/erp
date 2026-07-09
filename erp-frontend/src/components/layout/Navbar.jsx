"use client";

import Link from "next/link";

import { ChevronRight, ChevronsRight, Pencil } from "lucide-react";

import { useHeader } from "@/context/HeaderContext";

export default function Navbar() {
  const { config } = useHeader();

  const navbar = config.navbar;

  if (!navbar.title && navbar.breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className="h-[80px] bg-[#ebe9e9e8] flex  justify-between px-10  ">
      <div className="h-full    py-4">
        <div className="flex items-center gap-5">
          {navbar.breadcrumbs.length > 0 && (
            <div className="flex items-center text-sm">
              {navbar.breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center ">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="hover:underline text-blue-700"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-blue-700 ">{item.label}</span>
                  )}

                  {index !== navbar.breadcrumbs.length - 1 && (
                    <ChevronsRight size={14} className="mx-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {navbar.title && (
          <h2 className="font-semibold text-xl mt-2">{navbar.title}</h2>
        )}
      </div>
      <div className="h-px bg-gray-300 mt-4 me-3.5">
        {navbar.actionButton && (
          <button
            type="button"
            onClick={navbar.actionButton.onClick}
            className="
                flex items-center gap-2
                bg-[#1565c0]
                text-white
                px-8
                py-2
                rounded-md
                hover:bg-[#0f57a6]
                transition
                cursor-pointer
              "
          >
            

            <span>{navbar.actionButton.label}</span>
          </button>
        )}
      </div>
    </div>
  );
}
