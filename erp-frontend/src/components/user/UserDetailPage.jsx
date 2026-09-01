"use client";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { useAuth } from "@/context/AuthContext";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { loginAsUser, logoutUser } from "@/lib/api/auth-api";
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
import ActivityLogTimeline from "./ActivityLogTimeline";
import Loader from "@/components/common/Loader";
import AccessDenied from "@/components/common/AccessDenied";
import { useAsyncAction } from "@/hooks/useAsyncAction";

function DetailRow({ label, value }) {
 
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 min-w-[140px]">{label}</span>
      <span className="text-sm font-medium text-right">{value || "-"}</span>
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
  const [activeTab, setActiveTab] = useState("summary");
  const [displayedTab, setDisplayedTab] = useState("summary");
  const { execute: executeTabSwitch, isLoading: isTabSwitching } = useAsyncAction(1000);

  useEffect(() => {
    if (activeTab !== displayedTab) {
      executeTabSwitch(async () => {
        setDisplayedTab(activeTab);
      });
    }
  }, [activeTab, displayedTab, executeTabSwitch]);



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
        actionButton: can(CAPABILITIES.USER.UPDATE)
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
    can(CAPABILITIES.ACTIVITY_LOG.VIEW);

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

  if (
    !user ||
    user.success === 0 ||
    user.settings?.success === 0 ||
    !user.firstName
  ) {
    if (user?.accessDenied) {
      return <AccessDenied missingPermission={user.requiredPermission || CAPABILITIES.USER.VIEW} />;
    }
    return <div className="p-6 text-gray-500">User data could not be loaded.</div>;
  }
  return (
    <div className="py-6 px-10">
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
          {isTabSwitching ? (
            <div className="flex h-[60vh] items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : (
            <>
              {displayedTab === "summary" && (
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
                    {user.addedByName && (
                      <DetailRow
                        label="Added By"
                        value={user.addedByName}
                      />
                    )}
                    {user.updatedByName && (
                      <DetailRow
                        label="Updated By"
                        value={user.updatedByName}
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
              {displayedTab === "profiles" && (
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


              {/* {displayedTab === "activity" && (
                <div className="bg-white rounded-xl hover:shadow-lg transition py-6 me-4 h-[75vh]">
                  <div className="h-full">
                    <ActivityLogTimeline userId={user?.id} />
                  </div>
                </div>
              )} */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
