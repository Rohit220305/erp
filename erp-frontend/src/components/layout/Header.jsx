"use client";

import { useState } from "react";

import Image from "next/image";
import {
  Search,
  ChevronDown,
  Menu,
  X,
  Bookmark,
  Plus,
  RefreshCw,
  Upload,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
} from "lucide-react";
import MenuDrawer from "../common/MenuDrawer";
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
  filterDrawer: SlidersHorizontal,
  search: Search,
  view: LayoutGrid,
};

export default function Header() {
  const { config } = useHeader();
  const {
    user,
    allGroups,
    activeGroupId,
    switchProfile,
    logout,
    isImpersonating,
    backToSession,
  } = useAuth();
  const router = useRouter();
  const header = config.header;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
    } finally {
      logout();
      router.push("/login");
    }
  };

  const handleSwitchProfile = async (groupId) => {
    try {
      const res = await switchProfile(groupId);
      toast.success(res?.message || "Profile switched successfully");
      router.push("/");
    } catch (err) {
      toast.error(err?.message || "Failed to switch profile");
    }
  };

  const handleBackToSession = async () => {
    try {
      const prevSession = await backToSession();

      if (prevSession) {
        toast.success(
          `Back to ${prevSession.firstName} ${prevSession.lastName}'s session`,
        );
        router.push("/");
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
                    if (header.onColumnSearchClick) {
                      header.onColumnSearchClick();
                    } else {
                      header.onFilterClick?.();
                    }
                  } else if (icon === "filterDrawer") {
                    header.onFilterDrawerClick?.();
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
              allGroups={allGroups}
              activeGroupId={activeGroupId}
              onSwitchProfile={handleSwitchProfile}
              onProfile={() => user?.id && router.push(`/admin/${user.id}`)}
              onChangePassword={() => router.push("/settings/change-password")}
              onLogout={handleLogout}
              onBackToSession={handleBackToSession}
              isImpersonating={isImpersonating}
            />
          )}

          {header.showMenu && (
            <>
              <div className="h-10 w-px bg-gray-500" />
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span
                  className={`inline-flex transition-transform duration-500 ease-in-out ${
                    isMenuOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </span>
                <span>Menu</span>
              </button>
            </>
          )}

          <MenuDrawer
            open={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
