"use client";

import Link from "next/link";

import { ChevronRight, ChevronsRight } from "lucide-react";

import { useHeader } from "@/context/HeaderContext";

export default function Navbar() {
  const { config } = useHeader();

  const navbar = config.navbar;

  if (!navbar.title && navbar.breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className="h-[80px] bg-[#ebe9e9e8] ">
      <div className="h-full   px-10 py-4">
        {/* LEFT */}
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
                    <span className="text-blue-700">{item.label}</span>
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
          <h2 className="font-semibold text-xl ">{navbar.title}</h2>
        )}
      </div>
    </div>
  );
}
