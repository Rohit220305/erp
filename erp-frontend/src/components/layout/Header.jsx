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
import { logoutUser } from "@/lib/api/auth-api";
import toast from "react-hot-toast";

const iconMap = {
  // refresh: RefreshCw,
  // export: Upload,
  filter: Filter,
  search: Search,
  view: LayoutGrid,
};

export default function Header() {
  const { config } = useHeader();
  const { user, logout, isImpersonating, sessionStack, backToSession } =
    useAuth();
  const router = useRouter();
  const header = config.header;

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
    } finally {
      logout();
      router.push("/login");
    }
  };

  const handleBackToSession = async () => {
    try {
      const prevSession = await backToSession();

      if (prevSession) {
        toast.success(
          `Back to ${prevSession.user.firstName} ${prevSession.user.lastName}'s session`,
        );
        window.location.href = "/";
      } else {
        toast.error("No previous session found");
        await handleLogout();
      }
    } catch (err) {
      console.error("BackToSession error:", err);
      toast.error("Failed to return to previous session");
    }
  };

  return (
    <header className="bg-white border-b border-dashed border-gray-300 h-[74px]">
      <div className="h-full flex items-center justify-between px-8">
        {/* LEFT */}
        <div className="flex items-center">
          <div
            className="flex items-center hover:cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Image
              src="/images/production-logo.png"
              alt="logo"
              width={50}
              height={50}
            />
          </div>

          {/* <div className="mx-6 h-10 w-px bg-gray-300" />

          <div className="flex overflow-hidden rounded-md bg-gray-100">
            <div className="flex items-center p-2 px-3">
              <Search size={24} />
            </div>

            <input
              type="text"
              placeholder=""
              className="w-[220px] outline-none bg-gray-100"
            />

            <div className="h-full w-px bg-gray-300" />

            <button className="flex w-[160px] items-center justify-between rounded-r-md border border-gray-300 px-5 text-sm text-gray-400 transition hover:cursor-pointer">
              <span>ALL</span>
              <ChevronDown size={20} />
            </button>
          </div> */}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">
          {header.actionButton && (
            <button
              type="button"
              onClick={header.actionButton.onClick}
              className="flex items-center gap-2 cursor-pointer bg-[#1565c0] text-white px-4 py-2.5 rounded-md hover:bg-[#0f57a6] transition"
            >
              <Plus size={18} />
              <span>{header.actionButton.label}</span>
            </button>
          )}

          {header.icons?.map((icon) => {
            if (icon === "view") return <ViewSwitcher key="view" />;
            const Icon = iconMap[icon];
            if (!Icon) return null;

            return (
              <button
                key={icon}
                type="button"
                onClick={() => {
                  if (icon === "filter") {
                    header.onFilterClick?.();
                  } else if (icon === "search") {
                    if (header.onSearchClick) {
                      header.onSearchClick();
                    } else {
                      header.onFilterClick?.();
                    }
                  }
                }}
                className="cursor-pointer"
              >
                <Icon size={20} className="text-gray-600" />
              </button>
            );
          })}

          {/* {header.showBookmark && (
            <Bookmark size={20} className="text-gray-600 cursor-pointer" />
          )} */}

          {/* {header.showLanguage && <LanguageDropdown />} */}

          {header.showProfile && (
            <ProfileDropdown
              user={user}
              onProfile={() => user?.id && router.push(`/admin/${user.id}`)}
              onChangePassword={() => router.push("/settings/change-password")}
              onLogout={handleLogout}
              onBackToSession={handleBackToSession}
              isImpersonating={isImpersonating}
              sessionStack={sessionStack || []}
            />
          )}

          {/* {header.showMenu && (
            <>
              <div className="h-10 w-px bg-gray-300" />
              <button
                type="button"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Menu size={22} />
                <span>Menu</span>
              </button>
            </>
          )} */}
        </div>
      </div>
    </header>
  );
}
