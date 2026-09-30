"use client";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import useTabNavigation from "@/hooks/useTabNavigation";
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
import ModuleLink from "@/components/common/ModuleLink";
import SideDrawer from "@/components/common/SideDrawer";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";
import NoDataMessage from "../common/NoDataMessage";

function DetailRow({ label, value, href, onClick, valueNode }) {
  if (!value && !valueNode) return null;
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 min-w-[140px]">{label}</span>
      {valueNode ? (
        valueNode
      ) : href ? (
        <ModuleLink
          href={href}
          onClick={onClick}
          className="text-sm font-medium text-right"
        >
          {displayFormat(value)}
        </ModuleLink>
      ) : (
        <span className="text-sm font-medium text-right">
          {displayFormat(value)}
        </span>
      )}
    </div>
  );
}
function UserInfoCard({ title, name, date, userId, onOpenUser }) {
  const initial = name ? name.charAt(0).toUpperCase() : "S";
  return (
    <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-5">{title}</h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#1565c0] text-white flex items-center justify-center text-lg font-semibold shadow-sm shrink-0">
          {initial}
        </div>
        <div className="flex flex-col">
          {userId ? (
            <ModuleLink
              href={buildRoute("user", "detail", { id: userId })}
              onClick={onOpenUser}
              className="text-sm font-semibold text-[#1565c0] hover:underline cursor-pointer"
            >
              {displayFormat(name)}
            </ModuleLink>
          ) : (
            <span className="text-sm font-semibold text-gray-900">
              {displayFormat(name)}
            </span>
          )}
          {date && (
            <span className="text-xs text-gray-400 mt-1">
              {displayFormat(date, "DATE")}
            </span>
          )}
        </div>
      </div>
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
  const { activeTab, getTabHref } = useTabNavigation({
    moduleKey: "user",
    entityId: user?.id,
    defaultTab: "summary",
    validTabs: ["summary", "profiles", "activity"],
  });

  const [displayedTab, setDisplayedTab] = useState(activeTab);
  const { execute: executeTabSwitch, isLoading: isTabSwitching } = useAsyncAction(1000);
  const [sideDrawerState, setSideDrawerState] = useState({
    isOpen: false,
    moduleName: null,
    id: null,
  });

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
          { label: "User" },
          { label: "User Management", href: buildRoute("user", "list") },
        ],
        actionButton: can(CAPABILITIES.USER.UPDATE)
          ? {
              label: "Edit",
              onClick: () =>
                router.push(buildRoute("user", "edit", { id: user?.id })),
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
              <Link
                href={getTabHref("summary")}
                className={`w-full flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer transition ${
                  activeTab === "summary"
                    ? "bg-[#1565c0] text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <UserIcon size={16} /> Summary
              </Link>

              <Link
                href={getTabHref("profiles")}
                className={`w-full flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer transition ${
                  activeTab === "profiles"
                    ? "bg-[#1565c0] text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Other Profiles
              </Link>

              {canViewActivityLogs && (
                <Link
                  href={getTabHref("activity")}
                  className={`w-full flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer transition ${
                    activeTab === "activity"
                      ? "bg-[#1565c0] text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Activity size={16} /> Activity Logs
                </Link>
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
                          {displayFormat(user?.firstName)}{" "}
                          {displayFormat(user?.lastName)}
                        </h2>
                        <div>
                          <StatusBadge status={user?.status} />
                        </div>
                      </div>
                    </div>
                    <DetailRow label="First Name" value={user?.firstName} />
                    <DetailRow label="Last Name" value={user?.lastName} />
                    <DetailRow label="Username" value={user?.userName} />
                    {currentUser?.isSuperAdmin && user?.companyName && (
                      <DetailRow
                        label="Company"
                        value={user?.companyName}
                        href={
                          can(CAPABILITIES.COMPANY.VIEW) && user?.companyId
                            ? buildRoute("company", "detail", {
                                id: user.companyId,
                              })
                            : null
                        }
                        onClick={
                          can(CAPABILITIES.COMPANY.VIEW) && user?.companyId
                            ? () =>
                                setSideDrawerState({
                                  isOpen: true,
                                  moduleName: "Company",
                                  id: user.companyId,
                                })
                            : null
                        }
                      />
                    )}
                    {user?.id == currentUser?.id ? (
                      <DetailRow label="Role" value={currentUser?.groupName} />
                    ) : (
                      <DetailRow label="Profile" value={user?.groupName} />
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                      <h3 className="font-semibold mb-5">Contact Info</h3>
                      <div className="flex items-center gap-3 mb-3">
                        <Mail size={16} className="text-[#1565c0]" />
                        <span className="text-sm">
                          {displayFormat(user?.email)}
                        </span>
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
                          Last login:{" "}
                          {displayFormat(user?.lastLoginDateFormatted, "DATE")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {user.addedByName && (
                      <UserInfoCard
                        title="Added By"
                        name={user.addedByName}
                        date={user.addedDateFormatted}
                        userId={user.addedBy || user.addedById}
                        onOpenUser={
                          can(CAPABILITIES.USER.VIEW) &&
                          (user?.addedBy || user?.addedById)
                            ? () =>
                                setSideDrawerState({
                                  isOpen: true,
                                  moduleName: "User",
                                  id: user.addedBy || user.addedById,
                                })
                            : null
                        }
                      />
                    )}
                    {user.updatedByName && (
                      <UserInfoCard
                        title="Updated By"
                        name={user.updatedByName}
                        date={user.updatedDateFormatted}
                        userId={user.updatedBy || user.updatedById}
                        onOpenUser={
                          can(CAPABILITIES.USER.VIEW) &&
                          (user?.updatedBy || user?.updatedById)
                            ? () =>
                                setSideDrawerState({
                                  isOpen: true,
                                  moduleName: "User",
                                  id: user.updatedBy || user.updatedById,
                                })
                            : null
                        }
                      />
                    )}
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
                    <NoDataMessage moduleName="Other Profiles" />
                  )}
                </div>
              )}

              {displayedTab === "activity" && (
                <div className="bg-white rounded-xl hover:shadow-lg transition py-6 me-4 h-[75vh]">
                  <div className="h-full">
                    <ActivityLogTimeline userId={user?.id} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <SideDrawer
        open={sideDrawerState.isOpen}
        onClose={() =>
          setSideDrawerState({ isOpen: false, moduleName: null, id: null })
        }
        moduleName={sideDrawerState.moduleName}
        mode="details"
        data={sideDrawerState.id ? { id: sideDrawerState.id } : null}
      />
    </div>
  );
}
