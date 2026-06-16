"use client";

import { useEffect, useState } from "react";
import ListingPage from "@/components/listing/ListingPage";
import { useHeader } from "@/context/HeaderContext";
import { useListing } from "@/context/ListingContext";

export default function UserListPage() {
    const { setConfig, resetConfig } = useHeader();
    const { view } = useListing();
    const [users, setUsers] = useState([
        {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            role: "Admin",
            status: "Active",
            lastLogin: "2026-06-14",
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            role: "User",
            status: "Inactive",
            lastLogin: "2026-06-12",
        },
    ]);

    useEffect(() => {
        setConfig({
            header: {
                actionButton: {
                    label: "Add User",
                    onClick: () => console.log("Add user click"),
                },
                icons: ["refresh", "filter", "view"],
                showSearch: true,
            },
            navbar: {
                title: "User Management",
                breadcrumbs: [
                    { label: "Master" },
                    { label: "User Listing", href: "/users" },
                ],
            },
        });

        return () => resetConfig();
    }, []);

    const headers = [
        { label: "Name", key: "name" },
        { label: "Email", key: "email" },
        { label: "Role", key: "role" },
        { label: "Status", key: "status" },
        { label: "Last Login", key: "lastLogin" },
    ];

    const renderCell = (item, key) => {
        if (key === "status") {
            return (
                <span
                    className={`px-3 py-1 rounded-full text-xs ${item.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                >
                    {item.status}
                </span>
            );
        }
        return item[key];
    };

    const renderCard = (user) => (
        <div key={user.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-2 flex justify-between items-center">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {user.role}
                </span>
                <span className="text-xs text-gray-400">{user.lastLogin}</span>
            </div>
        </div>
    );

    return (
        <div className="px-6">
            <ListingPage
                view={view}
                data={users}
                headers={headers}
                renderCell={renderCell}
                renderListCard={renderCard}
                renderGridCard={renderCard}
            />
        </div>
    );
}
