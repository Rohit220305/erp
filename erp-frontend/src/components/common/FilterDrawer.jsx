"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function FilterDrawer({
  open,
  onClose,
  onSearch,
  onReset,
  filters,
  setFilters,
  groups = [],
  companies = [],
  statuses = [],
}) {

  // console.log("FilterDrawer filters:", filters, "groups:", groups, "companies:", companies, "statuses:", statuses);
  const [internalGroups, setInternalGroups] = useState([]);
  const [internalCompanies, setInternalCompanies] = useState([]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const fetchOptions = async () => {
      try {
        if (filters.hasOwnProperty("groupName") && filters.hasOwnProperty("companyName") && internalGroups.length === 0) {
          const { listGroups } = await import("@/lib/api/group-api");
          const res = await listGroups({ page: 1, limit: 1000 });
          const data = res?.settings?.data?.list || res?.data?.list || [];
          setInternalGroups(
            data.map((g) => ({ label: g.groupName, value: String(g.id) }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch groups in FilterDrawer", err);
      }

      try {
        if (filters.hasOwnProperty("companyName") && filters.hasOwnProperty("groupName") && internalCompanies.length === 0) {
          const { listCompanies } = await import("@/lib/api/company-api");
          const res = await listCompanies({ page: 1, limit: 1000 });
          const data = res?.settings?.data?.list || res?.data?.list || [];
          setInternalCompanies(
            data.map((c) => ({ label: c.companyName, value: String(c.id) }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch companies in FilterDrawer", err);
      }
    };

    fetchOptions();
  }, [open, filters, internalGroups.length, internalCompanies.length]);

  const activeGroups = groups.length > 0 ? groups : internalGroups;
  const activeCompanies = companies.length > 0 ? companies : internalCompanies;

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute right-0 top-0 h-full w-full max-w-[380px] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between bg-[#1565c0] px-6 py-5">
          <h2 className="text-xl font-semibold text-white">Filters</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 cursor-pointer  text-white transition hover:bg-white/15"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(100%-72px)] flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {filters.hasOwnProperty("firstName") && (
              <FilterField
                label="User"
                placeholder="Please enter Name"
                value={filters.firstName}
                onChange={(v) => setFilters((p) => ({ ...p, firstName: v }))}
              />
            )}

            {filters.hasOwnProperty("groupCode") && (
              <FilterField
                label="Group Code "
                placeholder="Please enter Group Code"
                value={filters.groupCode}
                onChange={(v) => setFilters((p) => ({ ...p, groupCode: v }))}
              />
            )}

            {filters.hasOwnProperty("groupName") &&
              (filters.hasOwnProperty("companyName") ? (
                <SelectField
                  label="Group"
                  placeholder="Select Group"
                  value={filters.groupName}
                  onChange={(v) => setFilters((p) => ({ ...p, groupName: v }))}
                  options={activeGroups}
                />
              ) : (
                <FilterField
                  label="Group"
                  placeholder="Please enter Group"
                  value={filters.groupName}
                  onChange={(v) => setFilters((p) => ({ ...p, groupName: v }))}
                />
              ))}

            {filters.hasOwnProperty("companyName") &&
              (filters.hasOwnProperty("groupName") ? (
                <SelectField
                  label="Company"
                  placeholder="Select Company"
                  value={filters.companyName}
                  onChange={(v) =>
                    setFilters((p) => ({ ...p, companyName: v }))
                  }
                  options={activeCompanies}
                />
              ) : (
                <FilterField
                  label="Company"
                  placeholder="Please enter Company"
                  value={filters.companyName}
                  onChange={(v) =>
                    setFilters((p) => ({ ...p, companyName: v }))
                  }
                />
              ))}

            {filters.hasOwnProperty("shortName") && (
              <FilterField
                label="Short Name"
                placeholder="Please enter Short Name"
                value={filters.shortName}
                onChange={(v) => setFilters((p) => ({ ...p, shortName: v }))}
              />
            )}

            {filters.hasOwnProperty("companyCode") && (
              <FilterField
                label="Company Code"
                placeholder="Please enter Company Code"
                value={filters.companyCode}
                onChange={(v) => setFilters((p) => ({ ...p, companyCode: v }))}
              />
            )}

            {filters.hasOwnProperty("email") && (
              <FilterField
                label="Email"
                placeholder="Please enter Email"
                value={filters.email}
                onChange={(v) => setFilters((p) => ({ ...p, email: v }))}
              />
            )}

            {filters.hasOwnProperty("phone") && (
              <FilterField
                label="Phone"
                placeholder="Please enter Phone"
                value={filters.phone}
                onChange={(v) => setFilters((p) => ({ ...p, phone: v }))}
              />
            )}

            {filters.hasOwnProperty("contactPersonName") && (
              <FilterField
                label="Contact Person"
                placeholder="Please enter Contact Person Name"
                value={filters.contactPersonName}
                onChange={(v) =>
                  setFilters((p) => ({ ...p, contactPersonName: v }))
                }
              />
            )}

            {filters.hasOwnProperty("currencyCode") && (
              <FilterField
                label="Currency Code"
                placeholder="Please enter Currency Code"
                value={filters.currencyCode}
                onChange={(v) => setFilters((p) => ({ ...p, currencyCode: v }))}
              />
            )}

            {filters.hasOwnProperty("currencyName") && (
              <FilterField
                label="Currency Name"
                placeholder="Please enter Currency Name"
                value={filters.currencyName}
                onChange={(v) => setFilters((p) => ({ ...p, currencyName: v }))}
              />
            )}

            {filters.hasOwnProperty("currencySymbol") && (
              <FilterField
                label="Currency Symbol"
                placeholder="Please enter Currency Symbol"
                value={filters.currencySymbol}
                onChange={(v) => setFilters((p) => ({ ...p, currencySymbol: v }))}
              />
            )}

            {filters.hasOwnProperty("status") && (
              <SelectField
                label="Status"
                placeholder="Select Status"
                value={filters.status}
                onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
                options={statuses}
              />
            )}
          </div>

          <div className="border-t bg-white px-6 pt-5 pb-10">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onReset}
                className="flex-1 cursor-pointer  rounded-md border border-[#1565c0] px-4 py-3 text-[#1565c0] transition hover:bg-blue-50"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={onSearch}
                className="flex-1 cursor-pointer rounded-md bg-[#1565c0] px-4 py-3 text-white transition hover:bg-[#0f57a6]"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterField({ label, placeholder, value, onChange }) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-[#1565c0] focus:bg-white"
      />
    </div>
  );
}

function SelectField({ label, placeholder, value, onChange, options }) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-gray-50 cursor-pointer px-4 py-3 outline-none transition focus:border-[#1565c0] focus:bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
