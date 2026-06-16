"use client";

import { useEffect, useState } from "react";
import ListingPage from "@/components/listing/ListingPage";
import { useHeader } from "@/context/HeaderContext";
import { useListing } from "@/context/ListingContext";

export default function GroupListPage() {
    const { setConfig, resetConfig } = useHeader();
    const { view } = useListing();
    const [groups, setGroups] = useState([
        {
            id: 1,
            groupName: "Sales",
            description: "Sales department group",
            members: 12,
            status: "Active",
        },
        {
            id: 2,
            groupName: "Marketing",
            description: "Marketing team",
            members: 8,
            status: "Active",
        },
    ]);

    useEffect(() => {
        setConfig({
            header: {
                actionButton: {
                    label: "Create Group",
                    onClick: () => console.log("Create group click"),
                },
                icons: ["refresh", "view"],
                showSearch: true,
            },
            navbar: {
                title: "Group Management",
                breadcrumbs: [
                    { label: "Master" },
                    { label: "Group Listing", href: "/groups" },
                ],
            },
        });

        return () => resetConfig();
    }, []);

    const headers = [
        { label: "Group Name", key: "groupName" },
        { label: "Description", key: "description" },
        { label: "Members", key: "members" },
        { label: "Status", key: "status" },
    ];

    const renderCell = (item, key) => {
        if (key === "status") {
            return (
                <span
                    className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700"
                >
                    {item.status}
                </span>
            );
        }
        return item[key];
    };

    const renderCard = (group) => (
        <div key={group.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium">{group.groupName}</h3>
            <p className="text-sm text-gray-500">{group.description}</p>
            <p className="text-xs mt-2 font-medium">Members: {group.members}</p>
        </div>
    );

    return (
        <div className="px-6">
            <ListingPage
                view={view}
                data={groups}
                headers={headers}
                renderCell={renderCell}
                renderListCard={renderCard}
                renderGridCard={renderCard}
            />
        </div>
    );
}
