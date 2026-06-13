"use client";

import Image from "next/image";

import {
  Search,
  ChevronDown,
  Menu,
  Bookmark,
  Plus,
  RefreshCw,
  Upload,
  Filter,
  LayoutGrid,
} from "lucide-react";

import LanguageDropdown from "../common/LanguageDropdown";

import { useHeader } from "@/context/HeaderContext";
import { useAuth } from "@/context/AuthContext";
import ProfileDropdown from "../common/ProfileDropdown";
import ViewSwitcher from "../listing/ViewSwitcher";
import { useRouter } from "next/navigation";

const iconMap = {
  refresh: RefreshCw,
  export: Upload,
  filter: Filter,
  view: LayoutGrid,
};

export default function Header() {
  const { config } = useHeader();

  const { user } = useAuth();

  const router = useRouter();

  const header = config.header;

  return (
    <header className="h-[74px] bg-white border-b border-dashed border-gray-300">
      <div className="h-full flex items-center justify-between px-8">
        {/* LEFT */}

        <div className="flex items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/images/production-logo.png"
              alt="logo"
              width={50}
              height={50}
            />
          </div>

          {/* Divider */}
          <div className="mx-6 h-10 w-px bg-gray-300" />

          {/* Search */}
          <div className="flex overflow-hidden rounded-md bg-gray-100">
            <div className="flex items-center p-2 px-3">
              <Search size={24} />
            </div>

            <input
              type="text"
              placeholder=""
              className="w-[220px] outline-none"
            />

            <div className="h-full w-px bg-gray-300" />

            <button
              className="
                  flex
                  w-[160px]
                  items-center
                  justify-between
                  rounded-r-md
                  border
                  border-gray-300
                  px-5
                  text-sm
                  text-gray-400
                  transition
                  hover:cursor-pointer
                "
            >
              <span>ALL</span>
              <ChevronDown size={20} />
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">
          {/* Dynamic Add Button */}
          {header.actionButton && (
            <button
              type="button"
              onClick={header.actionButton.onClick}
              className="
                flex items-center gap-2
                bg-[#1565c0]
                text-white
                px-4
                py-2.5
                rounded-md
                hover:bg-[#0f57a6]
                transition
              "
            >
              <Plus size={18} />

              <span>{header.actionButton.label}</span>
            </button>
          )}

          {/* Dynamic Icons */}
          {header.icons?.map((icon) => {
            if (icon === "view") {
              return <ViewSwitcher key="view" />;
            }

            const Icon = iconMap[icon];

            if (!Icon) return null;

            return (
              <button key={icon} type="button" className="cursor-pointer">
                <Icon size={20} className="text-gray-600" />
              </button>
            );
          })}

          {/* Bookmark */}
          {header.showBookmark && (
            <Bookmark size={20} className="text-gray-600 cursor-pointer" />
          )}

          {/* Language */}
          {header.showLanguage && <LanguageDropdown />}

          {/* Profile */}
          {header.showProfile && (
            <ProfileDropdown
              user={user}
              onProfile={() => console.log("Profile")}
              // onPreferences={() => console.log("Preferences")}
              onChangePassword={() => console.log("Change Password")}
              // onTheme={() => console.log("Theme")}
              onLogout={() => {
                localStorage.removeItem("user");
                router.push("/login");
              }}
            />
          )}

          {/* Menu */}
          {header.showMenu && (
            <>
              <div className="h-10 w-px bg-gray-300 " />

              <button
                type="button"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Menu size={22} />

                <span>Menu</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
