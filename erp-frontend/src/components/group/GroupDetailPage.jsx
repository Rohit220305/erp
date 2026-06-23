"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { getUser } from "@/lib/api/user-api";
import { Tag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 min-w-[140px]">{label}</span>
      <span className="text-sm font-medium text-right">{value || "-"}</span>
    </div>
  );
}

function AdminAvatar({ admin, companyId, onClick }) {
  return (
    <div
      className="flex items-center gap-3 cursor-pointer group"
      onClick={onClick}
    >
      {admin?.photoUrl ? (
        <img
          src={admin.photoUrl}
          alt="User"
          className="w-8 h-8 rounded-full object-cover border border-gray-200"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-xs border border-blue-200">
          {admin?.firstName?.[0] || "?"}
        </div>
      )}
      <div>
        <span className="text-sm text-[#1565c0] group-hover:text-black group-hover:underline block font-medium">
          {admin?.firstName && admin?.lastName
            ? `${admin.firstName} ${admin.lastName}`
            : "-"}
        </span>
      </div>
    </div>
  );
}

export default function GroupDetailPage({ group }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();
  const [addedAdmin, setAddedAdmin] = useState(null);
  const [updatedAdmin, setUpdatedAdmin] = useState(null);

  const fetchAdmins = useCallback(async () => {
    try {
      if (group.addedBy) {
        const res = await getUser(group.addedBy);
        setAddedAdmin(res);
      }
      if (group.updatedBy) {
        const res = await getUser(group.updatedBy);
        setUpdatedAdmin(res);
      }
    } catch (err) {
      console.error(err);
    }
  }, [group.addedBy, group.updatedBy]);

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
          { label: "Group Master", href: "/group" },
        ],
        actionButton: can("GROUP_UPDATE") ? {
          label: "Edit",
          onClick: () => router.push(`/group/edit/${group.id}`),
        } : null,
      },
    });

    fetchAdmins();
    return () => resetConfig();
  }, [setConfig, router, group.id, fetchAdmins, resetConfig, can]); // resetConfig is stable (useCallback) and only used in cleanup — not a dep

  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-2">
          <div className="bg-white rounded-xl hover:shadow-lg transition p-5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <Tag size={22} className="text-[#1565c0]" />
            </div>
            <h2 className="font-semibold text-lg">{group.groupName}</h2>
            <p className="text-gray-500 text-sm">{group.groupCode}</p>
            <hr className="my-4" />
            <button className="w-full bg-[#1565c0] text-white py-3 rounded-lg text-sm font-medium">
              Summary
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="col-span-12 lg:col-span-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6">
              <h3 className="font-semibold mb-5">Details</h3>
              <DetailRow label="Group Code" value={group.groupCode} />
              <DetailRow label="Group Name" value={group.groupName} />
              <DetailRow label="Description" value={group.description} />
              <DetailRow
                label="Status"
                value={
                  <span className={`font-medium ${
                    group.status === "Active" ? "text-green-600" : "text-red-600"
                  }`}>
                    {group.status === "Active" ? "Active" : "Inactive"}
                  </span>
                }
              />
            </div>

            {/* Added / Updated Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                <h3 className="font-semibold mb-5">Added Info</h3>
                <AdminAvatar
                  admin={addedAdmin}
                  onClick={() => group.addedBy && router.push(`/admin/${group.addedBy}`)}
                />
                <p className="text-xs text-gray-400 mt-2">{group.addedDateFormatted || "-"}</p>
              </div>

              {group.updatedBy && (
                <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                  <h3 className="font-semibold mb-5">Updated Info</h3>
                  <AdminAvatar
                    admin={updatedAdmin}
                    onClick={() => group.updatedBy && router.push(`/admin/${group.updatedBy}`)}
                  />
                  <p className="text-xs text-gray-400 mt-2">{group.updatedDateFormatted || "-"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
