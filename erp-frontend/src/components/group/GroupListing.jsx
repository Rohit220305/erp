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
      renderTableRow={(item, key) => <GroupTableRow item={item} columnKey={key} />}
      renderListCard={(item, setDetails) => <GroupListCard key={item.id} group={item} can={can} />}
      renderGridCard={(item, setDetails) => <GroupGridCard key={item.id} group={item} />}
      extraApiParams={{ includeSuperAdmin: user?.isSuperAdmin === true }}
    />
  );
}
