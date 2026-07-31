"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  User,
  Lock,
  LogOut,
  ArrowLeftCircle,
  Shield,
  Check,
  Repeat,
} from "lucide-react";

export default function ProfileDropdown({
  user,
  allGroups = [],
  activeGroupId = null,
  onSwitchProfile,
  onProfile,
  onChangePassword,
  onLogout,
  onBackToSession,
  isImpersonating = false,
  backToSessionLoading = false,
}) {
  const [open, setOpen] = useState(false);
  const [switchExpanded, setSwitchExpanded] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
        setSwitchExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showBackToSession = isImpersonating;

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
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 cursor-pointer"
      >
        {user?.photoUrl ? (
          <img
            src={user?.photoUrl}
            alt="user"
            className="h-10 w-10 object-cover rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 text-black flex items-center justify-center font-semibold text-xs border border-gray-200">
            {user?.firstName?.[0] || ""}
            {user?.lastName?.[0] || ""}
          </div>
        )}

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

      {open && (
        <div className="absolute right-0 top-[55px] z-[999] w-[280px] overflow-hidden rounded-md bg-white shadow-xl border border-gray-100 transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2">
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

          {allGroups && allGroups.length > 1 && (
            <div className="border-b border-gray-200">
              <button
                type="button"
                onClick={() => setSwitchExpanded((prev) => !prev)}
                className="group flex w-full items-center justify-between px-3 py-3 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 group-hover:border-blue-600 transition">
                    <Repeat
                      size={16}
                      className="text-gray-600 group-hover:text-blue-600 transition"
                    />
                  </div>
                  <span className="font-medium text-[14px] text-gray-700 group-hover:text-blue-600 transition">
                    Switch Profile
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform duration-300 ease-in-out ${
                    switchExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  switchExpanded
                    ? "max-h-[300px] opacity-100 border-t border-gray-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="bg-gray-50/80 py-1.5 space-y-1">
                  {allGroups.map((grp) => {
                    const isActive =
                      Number(grp.groupId) ===
                      Number(activeGroupId || user?.groupId);
                    return (
                      <button
                        key={grp.groupId}
                        onClick={async () => {
                          if (isActive) return;
                          setOpen(false);
                          setSwitchExpanded(false);
                          await onSwitchProfile?.(grp.groupId);
                        }}
                        className={`flex w-full items-center justify-between px-5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                          isActive
                            ? "bg-blue-100/70 text-[#1565c0] font-semibold"
                            : "text-gray-700 hover:bg-gray-200/60"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive ? "bg-[#1565c0]" : "bg-gray-400"
                            }`}
                          />
                          {grp.groupName}
                        </span>
                        {isActive ? (
                          <Check size={14} className="text-[#1565c0]" />
                        ) : grp.isPrimary ? (
                          <span className="text-[10px] bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
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
