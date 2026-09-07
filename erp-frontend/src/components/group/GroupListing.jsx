"use client";

import { useAuth } from "@/context/AuthContext";
import { listGroups, deleteGroup } from "@/lib/api/group-api";
import groupSchema from "@/config/group.config.json";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import GroupTableRow from "./GroupTableRow";
import GroupListCard from "./GroupListCard";
import GroupGridCard from "./GroupGridCard";

export default function GroupListing() {
  const { user, can } = useAuth();
  
  return (
    <DynamicListing
      schema={groupSchema}
      fetchData={listGroups}
      deleteFn={(target) => deleteGroup(target.id)}
      renderTableRow={(group, onRowAction) => (
        <GroupTableRow
          key={group.id}
          group={group}
          onRowAction={onRowAction}
        />
      )}
      renderListCard={(group) => (
        <GroupListCard
          key={group.id}
          group={group}
          can={can}
        />
      )}
      renderGridCard={(group) => (
        <GroupGridCard
          key={group.id}
          group={group}
        />
      )}
      extraApiParams={{ includeSuperAdmin: user?.isSuperAdmin === true }}
    />
  );
}
