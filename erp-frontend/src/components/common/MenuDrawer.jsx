"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Package,
  Factory,
  DollarSign,
  Headphones,
  Code,
  HelpCircle,
  Home,
  Building2,
  Shield,
  CircleDollarSign,
  Settings,
  Scale,
  Boxes,
  Building,
  Bell,
  Heart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { menuCategories } from "@/lib/menu/menu-data-v2";

const iconComponents = {
  LayoutDashboard,
  Users,
  BookOpen,
  Package,
  Factory,
  DollarSign,
  Headphones,
  Code,
  HelpCircle,
  Home,
  Building2,
  Shield,
  CircleDollarSign,
  Settings,
  Scale,
  Boxes,
  Building,
};

export default function MenuDrawer({ open, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const { can, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setActiveCategory(0);
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (open) onClose?.();
  }, [pathname]);

  const filteredCategories = menuCategories
    .map((cat) => {
      if (cat.superAdminOnly && !user?.isSuperAdmin) return null;
      if (cat.permission && !can(cat.permission)) return null;

      const filteredGroups = cat.groups
        .map((group) => {
          if (group.superAdminOnly && !user?.isSuperAdmin) return null;
          if (group.permission && !can(group.permission)) return null;

          const filteredItems = group.items.filter((item) => {
            if (item.superAdminOnly && !user?.isSuperAdmin) return false;
            if (item.permission && !can(item.permission)) return false;
            return true;
          });

          if (filteredItems.length === 0) return null;
          return { ...group, items: filteredItems };
        })
        .filter(Boolean);

      if (filteredGroups.length === 0) return null;
      return { ...cat, groups: filteredGroups };
    })
    .filter(Boolean);

  const selectedCategory = filteredCategories[activeCategory] || filteredCategories[0];

  const handleItemClick = (path) => {
    router.push(path);
    onClose?.();
  };

  const drawerContent = (
    <div
      className={`fixed inset-0 top-[74px] z-[45] transition-all duration-500 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-0 bg-white overflow-hidden transition-transform duration-500 ease-in-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex h-full">
          <nav className="w-[280px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-3">
            {filteredCategories.map((cat, idx) => {
              const Icon = iconComponents[cat.icon];
              const isActive = idx === activeCategory;

              return (
                <button
                  key={cat.category}
                  type="button"
                  onMouseEnter={() => setActiveCategory(idx)}
                  onClick={() => setActiveCategory(idx)}
                  className={`flex w-full items-center gap-3 px-5 py-3 text-[15px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "text-[#1565c0] bg-blue-50/60"
                      : "text-black hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {Icon && (
                    <Icon
                      size={18}
                      className={isActive ? "text-[#1565c0]" : "text-black"}
                    />
                  )}
                  <span>{cat.category}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex-1 overflow-y-auto bg-white">
            <div className="flex gap-0 h-full">
              {selectedCategory?.groups.map((group, idx) => {
                const GroupIcon = iconComponents[group.icon];

                return (
                  <div
                    key={group.title}
                    className={`min-w-[320px] max-w-[380px] py-5 px-6 ${
                      // idx > 0 ? "border-l border-gray-200" : ""
                      ""
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-3">
                      {GroupIcon && (
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full shrink-0 "
                          style={{ backgroundColor: "white" }}
                        >
                          <GroupIcon size={22} className={`text-[#1565c0]`} />
                        </div>
                      )}
                      <h3 className="text-[15px] font-semibold text-gray-900">
                        {group.title}
                      </h3>
                    </div>

                    <ul>
                      {group.items.map((item, itemIndex) => (
                        <li key={`${item.label}-${itemIndex}`} className="py-2">
                          <Link
                            href={item.path}
                            onClick={() => onClose?.()}
                            className="text-[15px] text-black hover:text-[#1565c0] cursor-pointer transition-colors block"
                          >
                            <span className="mr-2 text-black">-</span>
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* <div className="w-[280px] shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-gray-500" />
                  <h3 className="text-[14px] font-semibold text-gray-900">
                    Recent Activities
                  </h3>
                </div>
                <button
                  type="button"
                  className="text-[12px] text-[#1565c0] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <p className="text-[15px] text-gray-500 text-center py-4">
                {user
                  ? `Hello ${user.firstName} ${user.lastName}, Welcome To Production Planning.`
                  : "Your Recent Alerts will be displayed here."}
              </p>

              <div className="flex justify-center gap-1.5 mt-2">
                <span className="w-5 h-1.5 rounded-full bg-gray-500" />
                <span className="w-5 h-1.5 rounded-full bg-gray-200" />
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-gray-500" />
                  <h3 className="text-[14px] font-semibold text-gray-900">
                    Bookmark
                  </h3>
                </div>
                <button
                  type="button"
                  className="text-[12px] text-[#1565c0] hover:underline cursor-pointer"
                >
                  Add Bookmark
                </button>
              </div>

              <p className="text-[15px] text-gray-500 text-center py-4">
                No Bookmark found.
              </p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(drawerContent, document.body);
}
