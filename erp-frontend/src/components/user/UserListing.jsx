"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { listUsers, deleteUser } from "@/lib/api/user-api";
import { loginAsUser } from "@/lib/api/auth-api";
import { listCompanies } from "@/lib/api/company-api";
import { listGroups } from "@/lib/api/group-api";

import userSchema from "@/config/user.config.json";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import UserTableRow from "./UserTableRow";
import UserListCard from "./UserListCard";
import UserGridCard from "./UserGridCard";
import SideDrawer from "@/components/common/SideDrawer";
import { getCompany } from "@/lib/api/company-api";
import ResetPasswordDrawer from "./ResetPasswordDrawer";

export default function UserListing() {
  const { user: currentUser, can, loginAs } = useAuth();
  const router = useRouter();

  const [companyOptions, setCompanyOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);

  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] =
    useState(null);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] =
    useState(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const compRes = await listCompanies({ page: 1, limit: 1000 });
        const compData =
          compRes?.settings?.data?.list || compRes?.data?.list || [];
        setCompanyOptions(
          compData.map((c) => ({ label: c.companyName, value: String(c.id) })),
        );

        const grpRes = await listGroups({ page: 1, limit: 1000 });
        const grpData =
          grpRes?.settings?.data?.list || grpRes?.data?.list || [];
        setGroupOptions(
          grpData.map((g) => ({ label: g.groupName, value: String(g.id) })),
        );
      } catch (error) {
        console.error("Failed to load options", error);
      }
    };
    loadOptions();
  }, []);

  const handleLoginAs = async (targetUserId) => {
    try {
      const res = await loginAsUser(targetUserId);
      if (res?.success === 1 || res?.settings?.success === 1) {
        const data = res?.data || res?.settings?.data;
        loginAs(data, data?.token);
        toast.success(res?.message || "Logged in successfully");
        router.push("/");
      } else {
        toast.error(res?.message || "Failed to login as user");
      }
    } catch (error) {
      toast.error("Failed to login as user");
      console.error(error);
    }
  };

  const schema = JSON.parse(JSON.stringify(userSchema));

  schema.sidebarFields.forEach((field) => {
    if (field.value === "companyId") field.options = companyOptions;
    if (field.value === "groupId") field.options = groupOptions;
  });

  schema.searchFields.forEach((field) => {
    if (field.value === "companyId") field.options = companyOptions;
    if (field.value === "groupId") field.options = groupOptions;
  });

  if (!currentUser?.isSuperAdmin) {
    schema.columns = schema.columns.filter((col) => col.key !== "loginAs");
  }

  const dynamicSchema = schema;

  return (
    <>
      <DynamicListing
        schema={dynamicSchema}
        fetchData={listUsers}
        deleteFn={(target) => deleteUser(target.id)}
        renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
          <UserTableRow
            item={item}
            currentUser={currentUser}
            handleLoginAs={handleLoginAs}
            setSelectedUserForPasswordReset={setSelectedUserForPasswordReset}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
            setSelectedItemForDetails={setSelectedItemForDetails}
          />
        )}
        renderListCard={(item, setSelectedItemForDetails) => (
          <UserListCard
            key={item.id}
            user={item}
            handleLoginAs={handleLoginAs}
            currentUser={currentUser}
            can={can}
            setSelectedUserForDetails={setSelectedItemForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
          />
        )}
        renderGridCard={(item, setSelectedItemForDetails) => (
          <UserGridCard
            key={item.id}
            user={item}
            handleLoginAs={handleLoginAs}
            currentUser={currentUser}
            can={can}
            setSelectedUserForDetails={setSelectedItemForDetails}
            setSelectedUserForPasswordReset={setSelectedUserForPasswordReset}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
          />
        )}
      />

      <SideDrawer
        open={!!selectedCompanyForDetails}
        onClose={() => setSelectedCompanyForDetails(null)}
        moduleName="Company"
        mode="details"
        data={selectedCompanyForDetails ? { id: selectedCompanyForDetails.companyId } : null}
      />

      <ResetPasswordDrawer
        open={!!selectedUserForPasswordReset}
        onClose={() => setSelectedUserForPasswordReset(null)}
        user={selectedUserForPasswordReset}
      />
    </>
  );
}
