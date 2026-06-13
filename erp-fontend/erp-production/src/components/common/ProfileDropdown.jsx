"use client";

import { useState, useRef, useEffect } from "react";

import { ChevronUp, User, Settings, Lock, Palette, LogOut, ChevronDown } from "lucide-react";

export default function ProfileDropdown({
  user,
  onProfile,
  onPreferences,
  onChangePassword,
  onTheme,
  onLogout,
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

  const menuItems = [
    {
      label: "Profile",
      icon: User,
      action: onProfile,
    },
    // {
    //   label: "Preferences",
    //   icon: Settings,
    //   action: onPreferences,
    // },
    {
      label: "Change Password",
      icon: Lock,
      action: onChangePassword,
    },

    {
      label: "Logout",
      icon: LogOut,
      action: onLogout,
    },
  ];

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="
          flex
          items-center
          gap-3
          cursor-pointer
        "
      >
        <img
          src={user?.photoUrl || "/images/user-avatar.png"}
          alt="user"
          className="h-10 w-10 object-cover"
        />

        <div className="text-right">
          <p className="text-[15px] font-medium">
            {user?.firstName} {user?.lastName}
          </p>

          <p className="text-xs text-gray-500">{user?.groupName}</p>
        </div>

        <ChevronDown
          size={18}
          className={`transition-transform duration-400 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
    absolute
    right-0
    top-[55px]
    w-[250px]
    overflow-hidden
    rounded-md
    bg-white
    shadow-xl
    z-[999]
  "
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => {
                  setOpen(false);
                  item.action?.();
                }}
                className="
          group
          flex
          w-full
          items-center
          gap-4
          border-b
          border-gray-200
          px-3
          py-2
          hover:bg-gray-50
          transition
          cursor-pointer
        "
              >
                <div
                  className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-gray-300
            group-hover:border-blue-600
            transition
          "
                >
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
        </div>  
      )}
    </div>
  );
}
