"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

const LANGUAGES = [
  {
    code: "en",
    name: "English",
    flag: "/flags/us.png",
  },
//   {
//     code: "de",
//     name: "German",
//     flag: "/flags/germany.png",
//   },
//   {
//     code: "fr",
//     name: "French",
//     flag: "/flags/france.png",
//   },
//   {
//     code: "hi",
//     name: "Hindi",
//     flag: "/flags/india.png",
//   },
//   {
//     code: "ar",
//     name: "Arabic",
//     flag: "/flags/saudi.png",
//   },
//   {
//     code: "es",
//     name: "Spanish",
//     flag: "/flags/spain.png",
//   },
];

export default function LanguageDropdown() {
  const [open, setOpen] = useState(false);

  const [selected, setSelected] = useState(LANGUAGES[0]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSelect = (language) => {
    setSelected(language);
    setOpen(false);

    console.log("Selected Language:", language);
  };

  return (
    <div ref={dropdownRef} className="relative">
    
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-3  w-[120px]    cursor-pointer"
      >
        <Image src={selected.flag} alt={selected.name} width={18} height={18} />

        <span className="flex-1 text-left text-sm">{selected.name}</span>

        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>


      {open && (
        <div className="absolute right-0 top-full z-50  overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="max-h-[200px] overflow-y-auto">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => handleSelect(language)}
                className={`flex w-full items-center gap-3 px-2 py-1 text-left text-sm transition hover:bg-blue-600 hover:text-white cursor-pointer `}
              >
                <Image
                  src={language.flag}
                  alt={language.name}
                  width={20}
                  height={20}
                />

                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
