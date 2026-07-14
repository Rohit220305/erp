"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { useAuth } from "@/context/AuthContext";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { loginAsUser, logoutUser } from "@/lib/api/auth-api";
import { getUser } from "@/lib/api/user-api";
import {
  Mail,
  Phone,
  Building2,
  LogIn,
  Calendar,
  ArrowLeft,
  Activity,
  User as UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import ActivityLogTimeline from "./ActivityLogTimeline";

function DetailRow({ label, value, isRestricted }) {
  if (isRestricted) {
    return (
      <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0 opacity-70">
        <span className="text-sm text-gray-500 min-w-[140px]">{label}</span>
        <span className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
          <span className="text-xs">🔒</span> Restricted
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 min-w-[140px]">{label}</span>
      <span className="text-sm font-medium text-right">{value || "-"}</span>
    </div>
  );
}

function AdminLink({ admin, onClick, isRestricted, canNavigate = true }) {
  if (isRestricted) {
    return (
      <div className="flex items-center gap-2 py-1.5 text-gray-400">
        <span className="text-xs">🔒</span>
        <span className="text-sm italic font-medium">Restricted Info</span>
      </div>
    );
  }
  if (!admin) return null;

  const isClickable = canNavigate && onClick;

  return (
    <div
      className={`flex items-center gap-3 ${isClickable ? "cursor-pointer group" : ""}`}
      onClick={isClickable ? onClick : undefined}
    >
      {admin.photoUrl ? (
        <img
          src={admin.photoUrl}
          alt="User"
          className="w-8 h-8 rounded-full object-cover border border-gray-200"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-xs border border-blue-200">
          {admin.firstName?.[0] || "?"}
        </div>
      )}
      <span
        className={`text-sm font-medium ${isClickable ? "text-[#1565c0] group-hover:underline" : "text-gray-850"}`}
      >
        {`${admin.firstName} ${admin.lastName}`}
      </span>
    </div>
  );
}

export default function UserDetailPage({ user }) {
  const { setConfig, resetConfig } = useHeader();
  const {
    user: currentUser,
    loginAs,
    backToSession,
    isImpersonating,
    sessionStack,
    canImpersonate,
    can,
  } = useAuth();
  const router = useRouter();
  const [addedAdmin, setAddedAdmin] = useState(null);
  const [updatedAdmin, setUpdatedAdmin] = useState(null);
  const [addedAdminRestricted, setAddedAdminRestricted] = useState(false);
  const [updatedAdminRestricted, setUpdatedAdminRestricted] = useState(false);
  const [activeTab, setActiveTab] = useState("summary"); // "summary" | "activity"
  const [loginAsLoading, setLoginAsLoading] = useState(false);
  const [backToSessionLoading, setBackToSessionLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    // If user lacks USER_VIEW permission and is not viewing themselves, mark as restricted
    const canViewOthers = can("USER_VIEW") || currentUser?.isSuperAdmin;

    if (user.addedBy) {
      if (!canViewOthers && currentUser?.id !== user.addedBy) {
        setAddedAdminRestricted(true);
      } else {
        try {
          const fetchedUser = await getUser(user.addedBy);
          if (
            fetchedUser &&
            fetchedUser.firstName &&
            fetchedUser.success !== 0 &&
            fetchedUser.settings?.success !== 0
          ) {
            setAddedAdmin(fetchedUser);
            setAddedAdminRestricted(false);
          } else {
            setAddedAdminRestricted(true);
          }
        } catch (err) {
          console.error("Failed to fetch admin details:", err);
          setAddedAdminRestricted(true);
        }
      }
    }

    if (user.updatedBy) {
      if (!canViewOthers && currentUser?.id !== user.updatedBy) {
        setUpdatedAdminRestricted(true);
      } else {
        try {
          const fetchedUser = await getUser(user.updatedBy);
          if (
            fetchedUser &&
            fetchedUser.firstName &&
            fetchedUser.success !== 0 &&
            fetchedUser.settings?.success !== 0
          ) {
            setUpdatedAdmin(fetchedUser);
            setUpdatedAdminRestricted(false);
          } else {
            setUpdatedAdminRestricted(true);
          }
        } catch (err) {
          console.error("Failed to fetch updater details:", err);
          setUpdatedAdminRestricted(true);
        }
      }
    }
  }, [user.addedBy, user.updatedBy, can, currentUser]);

  useEffect(() => {
    setConfig({
      header: {
        actionButton: null,
        icons: ["refresh"],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
      },
      navbar: {
        title: "Details",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: "User Management", href: "/admin" },
        ],
        actionButton: can("USER_UPDATE")
          ? {
              label: "Edit",
              onClick: () => router.push(`/admin/edit/${user.id}`),
            }
          : null,
      },
    });
    fetchAdmins();
    return () => resetConfig();
  }, [setConfig, router, user.id, fetchAdmins, resetConfig, can]);

  const canViewActivityLogs =
    currentUser?.isSuperAdmin ||
    currentUser?.sub === user.id ||
    can("ACTIVITY_LOG_VIEW");
  console.log(
    "UserDetailPage  render: user=",
    user,
    "currentUser=",
    currentUser,
    "canViewActivityLogs=",
    canViewActivityLogs,
  );
  console.log(
    user.firstName,
    user.lastName,
    "addedBy=",
    user.addedBy,
    "updatedBy=",
    user.updatedBy,
    "addedAdmin=",
    addedAdmin,
    "updatedAdmin=",
    updatedAdmin,
  );
  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-2">
          <div className="bg-white rounded-xl hover:shadow-lg transition p-5">
            <SharedImageZoom
              id={`detail-${user.id}`}
              src={user.photoUrl}
              alt={`${user.firstName} ${user.lastName}`}
              placeholderText={`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`}
              thumbnailClassName="w-16 h-16 rounded-full object-cover border-2 border-gray-200 mb-3"
              modalImageClassName="w-72 h-72 rounded-full"
            />
            <h2 className="font-semibold text-base">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-500 text-sm">{user.groupName || "—"}</p>
            <p className="text-xs text-gray-400">{user.companyName || "—"}</p>

            {user.isSuperAdmin ? (
              <span className="mt-2 inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                Super Admin
              </span>
            ) : null}

            <hr className="my-4" />

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("summary")}
                className={`w-full flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer transition ${
                  activeTab === "summary"
                    ? "bg-[#1565c0] text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <UserIcon size={16} /> Summary
              </button>

              {canViewActivityLogs && (
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`w-full flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer transition ${
                    activeTab === "activity"
                      ? "bg-[#1565c0] text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Activity size={16} /> Activity Logs
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-10">
          {activeTab === "summary" ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6">
                <h3 className="font-semibold mb-5">Personal Details</h3>
                <DetailRow label="First Name" value={user.firstName} />
                <DetailRow label="Last Name" value={user.lastName} />
                <DetailRow label="Username" value={user.userName} />
                <DetailRow
                  label="Status"
                  value={
                    <span
                      className={`font-medium ${user.status === "Active" ? "text-green-600" : "text-red-600"}`}
                    >
                      {user.status}
                    </span>
                  }
                />
                <DetailRow
                  label="Super Admin"
                  value={user.isSuperAdmin ? "Yes" : "No"}
                />
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                  <h3 className="font-semibold mb-5">Contact Info</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Mail size={16} className="text-[#1565c0]" />
                    <span className="text-sm">{user.email || "-"}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 mb-3">
                      <Phone size={16} className="text-[#1565c0]" />
                      <span className="text-sm">
                        {user.dialCode} {user.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-[#1565c0]" />
                    <span className="text-sm">
                      Last login: {user.lastLoginDateFormatted || "Never"}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                  <h3 className="font-semibold mb-5">Company & Role</h3>
                  <DetailRow label="Company" value={user.companyName} />
                  <DetailRow label="Group / Role" value={user.groupName} />
                </div>
              </div>

              {/* <div className="space-y-6">
                {!addedAdminRestricted && (
                  <>
                    {user.addedBy && (
                      <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                        <h3 className="font-semibold mb-5">Added Info</h3>
                        <AdminLink
                          admin={addedAdmin}
                          isRestricted={addedAdminRestricted}
                          canNavigate={
                            currentUser?.isSuperAdmin ||
                            can("USER_CREATE") ||
                            can("USER_UPDATE")
                          }
                          onClick={() =>
                            !addedAdminRestricted &&
                            user.addedBy &&
                            router.push(`/admin/${user.addedBy}`)
                          }
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          {user.addedDateFormatted || "-"}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {!updatedAdminRestricted && (
                  <>
                    {user.updatedBy && (
                      <div className="bg-white rounded-xl p-6 hover:shadow-lg transition">
                        <h3 className="font-semibold mb-5">Updated Info</h3>
                        <AdminLink
                          admin={updatedAdmin}
                          isRestricted={updatedAdminRestricted}
                          canNavigate={
                            currentUser?.isSuperAdmin ||
                            can("USER_CREATE") ||
                            can("USER_UPDATE")
                          }
                          onClick={() =>
                            !updatedAdminRestricted &&
                            user.updatedBy &&
                            router.push(`/admin/${user.updatedBy}`)
                          }
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          {user.updatedDateFormatted || "-"}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div> */}
            </div>
          ) : (
            <div className="bg-white rounded-xl hover:shadow-lg transition py-6 me-4 h-[75vh]  ">
              
              <div className="h-full">
                <ActivityLogTimeline userId={user.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
