"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { listCompanies, deleteCompany } from "@/lib/api/company-api";
import CompanyListCard from "./CompanyListCard";
import CompanyGridCard from "./CompanyGridCard";
import ConfigDrivenListing from "@/components/core/dynamic-ui/ConfigDrivenListing";
import companyConfig from "@/config/company.config.json";
import ConfirmModal from "@/components/common/ConfirmModal";
import toast from "react-hot-toast";

export default function CompanyListPage() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleRowAction = useCallback((action, item) => {
    if (action.type === "editRedirect") {
      let path = action.path;
      if (path.includes("{id}")) {
        path = path.replace("{id}", item.id);
      }
      router.push(path);
    } else if (action.type === "deleteModal") {
      setDeleteTarget(item);
    }
  }, [router]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteCompany(deleteTarget.id);
      const isSuccess = res?.success === 1 || res?.settings?.success === 1;
      const message = res?.message || res?.settings?.message;
      if (isSuccess) {
        toast.success("Company deleted successfully");
        // We need a way to refresh the listing, typically by triggering a re-fetch.
        // A simple window reload or triggering context works for now.
        window.location.reload(); 
      } else {
        toast.error(message || "Failed to delete company");
      }
    } catch {
      toast.error("Failed to delete company");
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  return (
    <div className="h-full">
      <ConfigDrivenListing
        config={companyConfig}
        fetchData={listCompanies}
        onRowAction={handleRowAction}
        renderListCard={(c) => <CompanyListCard key={c.id} company={c} />}
        renderGridCard={(c) => <CompanyGridCard key={c.id} company={c} />}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Company"
        message={`Are you sure you want to delete "${deleteTarget?.companyName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
