"use client";

import { useEffect, useState } from "react";
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
  Star,
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
    activeGroupId,
    can,
  } = useAuth();
  const router = useRouter();
  const [addedAdmin, setAddedAdmin] = useState(null);
  const [updatedAdmin, setUpdatedAdmin] = useState(null);
  const [addedAdminRestricted, setAddedAdminRestricted] = useState(false);
  const [updatedAdminRestricted, setUpdatedAdminRestricted] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    async function fetchAdmins() {
      const canViewOthers = can("USER_VIEW") || currentUser?.isSuperAdmin;

      if (user?.addedBy) {
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

      if (user?.updatedBy) {
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
    }

    fetchAdmins();
  }, [
    user?.addedBy,
    user?.updatedBy,
    can,
    currentUser?.id,
    currentUser?.isSuperAdmin,
  ]);

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
              onClick: () => router.push(`/admin/edit/${user?.id}`),
            }
          : null,
      },
    });
    return () => resetConfig();
  }, [setConfig, router, user?.id, resetConfig, can]);

  const canViewActivityLogs =
    currentUser?.isSuperAdmin ||
    currentUser?.sub === user?.id ||
    can("ACTIVITY_LOG_VIEW");

  const isCurrentUser =
    Number(user?.id) === Number(currentUser?.id || currentUser?.sub);
  const userGroups = user?.groups || [];

  const otherProfiles = userGroups.filter((grp) => {
    if (isCurrentUser) {
      const currentActiveId = activeGroupId || currentUser?.groupId;
      return Number(grp.groupId) !== Number(currentActiveId);
    }
    return !grp.isPrimary;
  });

  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-2">
          <div className="bg-white rounded-xl hover:shadow-lg transition p-5">
            <h2 className="font-semibold text-base">
              {user?.firstName} {user?.lastName}
            </h2>

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

              <button
                onClick={() => setActiveTab("profiles")}
                className={`w-full flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer transition ${
                  activeTab === "profiles"
                    ? "bg-[#1565c0] text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Other Profiles
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
          {activeTab === "summary" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6">
                <div className="flex    gap-4 mb-6">
                  <SharedImageZoom
                    id={`detail-${user?.id}`}
                    src={user?.photoUrl}
                    alt={`${user?.firstName} ${user?.lastName}`}
                    placeholderText={`${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`}
                    thumbnailClassName="w-16 h-16 rounded-full object-cover border-2 border-gray-200 mb-3"
                    modalImageClassName="w-72 h-72 rounded-full"
                  />
                  <div className="flex flex-col justify-center gap-1">
                    <h2 className="font-semibold text-lg">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <div>
                      <span
                        className={` px-2 py-1  text-white rounded-lg ${user?.status === "Active" ? "bg-green-600 " : "bg-red-600"}`}
                      >
                        {user?.status}
                      </span>
                    </div>
                  </div>
                </div>
                <DetailRow label="First Name" value={user?.firstName} />
                <DetailRow label="Last Name" value={user?.lastName} />
                <DetailRow label="Username" value={user?.userName} />
                {user?.companyName && (
                  <DetailRow label="Company" value={user?.companyName} />
                )}
                {user?.id == currentUser?.id ? (
                  <DetailRow label="Role" value={currentUser?.groupName} />
                ) : (
                  <DetailRow label="Profile" value={user?.groupName} />
                )}

                {user.addedDateFormatted && (
                  <DetailRow
                    label="Added Date"
                    value={user.addedDateFormatted}
                  />
                )}
                {user.updatedDateFormatted && (
                  <DetailRow
                    label="Updated Date"
                    value={user.updatedDateFormatted}
                  />
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                  <h3 className="font-semibold mb-5">Contact Info</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Mail size={16} className="text-[#1565c0]" />
                    <span className="text-sm">{user?.email || "-"}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-3 mb-3">
                      <Phone size={16} className="text-[#1565c0]" />
                      <span className="text-sm">
                        {user?.dialCode} {user?.phone}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-[#1565c0]" />
                    <span className="text-sm">
                      Last login: {user?.lastLoginDateFormatted || "Never"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "profiles" && (
            <div className="bg-white rounded-xl hover:shadow-lg transition p-6 me-4">
              <h3 className="font-semibold mb-5">Other Profiles</h3>
              {otherProfiles.length > 0 ? (
                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/80 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                          #
                        </th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Profile
                        </th> 
                        <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Group Code
                        </th>
                        {/* <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                              Type
                            </th> */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {otherProfiles.map((grp, idx) => (
                        <tr
                          key={grp.groupId}
                          className="hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm text-gray-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                            {grp.groupName}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {grp.groupCode || "-"}
                          </td>
                          {/* <td className="py-3.5 px-4 text-sm text-right">
                                {grp.isPrimary ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-[#1565c0] px-2.5 py-1 rounded-full border border-blue-100">
                                    <Star size={12} className="fill-[#1565c0]" /> Primary
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                                    Secondary
                                  </span>
                                )}
                              </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                  No other profiles available.
                </div>
              )}
            </div>
          )}


          {activeTab === "activity" && (
            <div className="bg-white rounded-xl hover:shadow-lg transition py-6 me-4 h-[75vh]">
              <div className="h-full">
                <ActivityLogTimeline userId={user?.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
