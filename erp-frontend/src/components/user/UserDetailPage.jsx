"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { useAuth } from "@/context/AuthContext";
import { loginAsUser, logoutUser } from "@/lib/api/auth-api";
import { getUser } from "@/lib/api/user-api";
import {
  Mail,
  Phone,
  Building2,
  LogIn,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 min-w-[140px]">{label}</span>
      <span className="text-sm font-medium text-right">{value || "-"}</span>
    </div>
  );
}

function AdminLink({ admin, onClick }) {
  if (!admin) return null;

  return (
    <div
      className="flex items-center gap-3 cursor-pointer group"
      onClick={onClick}
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
      <span className="text-sm text-[#1565c0] group-hover:underline font-medium">
        {`${admin.firstName} ${admin.lastName}`}
      </span>
    </div>
  );
}

function ImpersonationBanner({ sessionStack, onBack }) {
  if (sessionStack.length === 0) return null;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogIn size={20} className="text-purple-600" />
          <div>
            <p className="text-sm font-semibold text-purple-700">
              You're impersonating a user
            </p>
            {/* <p className="text-xs text-purple-600 mt-1">
              Stack: {sessionStack.length} previous session(s)
            </p> */}
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
        >
          <ArrowLeft size={16} />
          Back to previous session
        </button>
      </div>
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
  const [loginAsLoading, setLoginAsLoading] = useState(false);
  const [backToSessionLoading, setBackToSessionLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      if (user.addedBy) setAddedAdmin(await getUser(user.addedBy));
      if (user.updatedBy) setUpdatedAdmin(await getUser(user.updatedBy));
    } catch (err) {
      console.error("Failed to fetch admin details:", err);
    }
  }, [user.addedBy, user.updatedBy]);

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
        actionButton: can("USER_UPDATE") ? {
          label: "Edit",
          onClick: () => router.push(`/admin/edit/${user.id}`),
        } : null,
      },
    });
    fetchAdmins();
    return () => resetConfig();
  }, [setConfig, router, user.id, fetchAdmins, resetConfig, can]);

  const handleLoginAs = useCallback(async () => {
    if (!currentUser?.isSuperAdmin) {
      toast.error("Only super admins can impersonate users");
      return;
    }

    if (currentUser.sub === user.id) {
      toast.error("Cannot impersonate yourself");
      return;
    }

    try {
      setLoginAsLoading(true);
      const res = await loginAsUser(user.id);

      if (res?.success === 1 && res?.data) {
        // Pass token if API returns it
        const token = res.data.token || null;
        loginAs(res.data, token);

        toast.success(
          `Successfully logged in as ${user.firstName} ${user.lastName}`,
        );

        // Wait for auth state to update before redirecting
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push("/");
      } else {
        toast.error(res?.message || "Failed to login as user");
      }
    } catch (err) {
      console.error("LoginAs error:", err);
      toast.error(
        "Failed to login as user: " + (err.message || "Unknown error"),
      );
    } finally {
      setLoginAsLoading(false);
    }
  }, [currentUser, user, loginAs, router]);

 const handleBackToSession = useCallback(async () => {
   try {
     setBackToSessionLoading(true);

     const prevSession = await backToSession();

     if (prevSession) {
       toast.success(
         `Back to ${prevSession.user.firstName} ${prevSession.user.lastName}'s session`,
       );

       // FORCE FULL PAGE RELOAD - this is critical!
       window.location.href = "/";
     } else {
       toast.error("No previous session found");
       setBackToSessionLoading(false);
       logoutUser();
       window.location.href = "/login";
     }
   } catch (err) {
     console.error("BackToSession error:", err);
     toast.error("Failed to return to previous session");
     setBackToSessionLoading(false);
   }
 }, [backToSession]);
  // Can impersonate if: current user is super admin AND viewing someone else
  const canLoginAsThisUser = canImpersonate && currentUser?.sub !== user.id;
  // Add right after the useAuth() call
  
  return (
    <div className="p-6">
      {/* Impersonation Banner - Shows when user is impersonating */}
      {/* <ImpersonationBanner
        sessionStack={sessionStack}
        onBack={handleBackToSession}
      /> */}

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-2">
          <div className="bg-white rounded-xl hover:shadow-lg transition p-5">
            {/* Avatar */}
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.firstName}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 mb-3"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 text-[#1565c0] flex items-center justify-center font-bold text-2xl border-2 border-blue-200 mb-3">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
            )}
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

            <button className="w-full bg-[#1565c0] text-white py-2.5 rounded-lg text-sm font-medium mb-2">
              Summary
            </button>

            {/* LOGIN AS button — only for super admin viewing another user */}
            {canLoginAsThisUser ? (
              <button
                onClick={handleLoginAs}
                disabled={loginAsLoading || isImpersonating}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
                title={
                  isImpersonating
                    ? "Return to previous session first"
                    : "Login as this user"
                }
              >
                <LogIn size={15} />
                {loginAsLoading ? "Switching..." : `Login As ${user.firstName}`}
              </button>
            ) : null}

            {isImpersonating && !canLoginAsThisUser && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                You're in another session. Return first to impersonate.
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="col-span-12 lg:col-span-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Details */}
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

            {/* Contact + Company */}
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

            {/* Added / Updated */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                <h3 className="font-semibold mb-5">Added Info</h3>
                <AdminLink
                  admin={addedAdmin}
                  onClick={() =>
                    user.addedBy && router.push(`/admin/${user.addedBy}`)
                  }
                />
                <p className="text-xs text-gray-400 mt-2">
                  {user.addedDateFormatted || "-"}
                </p>
              </div>

              {user.updatedBy && (
                <div className="bg-white rounded-xl p-6 hover:shadow-lg transition">
                  <h3 className="font-semibold mb-5">Updated Info</h3>
                  <AdminLink
                    admin={updatedAdmin}
                    onClick={() =>
                      user.updatedBy && router.push(`/admin/${user.updatedBy}`)
                    }
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {user.updatedDateFormatted || "-"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
