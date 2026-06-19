"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  User,
  Lock,
  LogOut,
  ArrowLeftCircle,
  LogIn,
} from "lucide-react";

export default function ProfileDropdown({
  user,
  onProfile,
  onChangePassword,
  onLogout,
  onBackToSession,
  isImpersonating = false,
  sessionStack = [],
  backToSessionLoading = false,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showBackToSession = isImpersonating && sessionStack.length > 0;

  const menuItems = [
    {
      label: "Profile",
      icon: User,
      action: onProfile,
    },
    {
      label: "Change Password",
      icon: Lock,
      action: onChangePassword,
    },
  ];

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 cursor-pointer"
      >
        <img
          src={user?.photoUrl || "/images/user-avatar.png"}
          alt="user"
          className="h-10 w-10 object-cover rounded-full"
        />

        <div className="text-right">
          <p className="text-[15px] font-medium">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500">{user?.groupName}</p>
        </div>

        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[55px] z-[999] w-[280px] overflow-hidden rounded-md bg-white shadow-xl">
          {showBackToSession && (
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await onBackToSession?.();
              }}
              disabled={backToSessionLoading}
              className="group flex w-full items-center gap-4 border-b border-gray-200 px-3 py-3 hover:bg-gray-50 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 group-hover:border-blue-600 transition">
                {backToSessionLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                ) : (
                  <ArrowLeftCircle
                    size={16}
                    className="text-gray-600 group-hover:text-blue-600 transition"
                  />
                )}
              </div>

              <span className="font-medium text-[14px] text-gray-700 group-hover:text-blue-600 transition">
                Back to previous session
              </span>
            </button>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => {
                  setOpen(false);
                  item.action?.();
                }}
                className="group flex w-full items-center gap-4 border-b border-gray-200 px-3 py-3 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 group-hover:border-blue-600 transition">
                  <Icon
                    size={16}
                    className="text-gray-600 group-hover:text-blue-600 transition"
                  />
                </div>

                <span className="font-medium text-[14px] text-gray-700 group-hover:text-blue-600 transition">
                  {item.label}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            className="group flex w-full items-center gap-4 px-3 py-3 hover:bg-gray-50 transition cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 group-hover:border-red-500 transition">
              <LogOut
                size={16}
                className="text-gray-600 group-hover:text-red-500 transition"
              />
            </div>

            <span className="font-medium text-[14px] text-gray-700 group-hover:text-red-500 transition">
              Logout
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
