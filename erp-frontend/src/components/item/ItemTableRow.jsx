"use client";

import { useAuth } from "@/context/AuthContext";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import itemConfig from "@/config/item.config.json";
import { Package } from "lucide-react";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";

export default function ItemTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCategoryForDetails,
  setSelectedCompanyForDetails,
  setSelectedManufacturerForDetails,
  setSelectedBrandForDetails,
  setSelectedItemUomForDetails,
  setSelectedPackageForDetails,
  setSelectedStorageForDetails,
}) {
  const { can, user } = useAuth();
  const isActive = item.status === "Active" || item.status === "active";
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");
  const canViewCategory = can(CAPABILITIES.ITEM_CATEGORY?.VIEW || "ITEM_CATEGORY_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");
  const canViewManufacturer = can(CAPABILITIES.MANUFACTURER?.VIEW || "MANUFACTURER_VIEW");
  const canViewBrand = can(CAPABILITIES.BRAND?.VIEW || "BRAND_VIEW");
  const canViewItemUom = can(CAPABILITIES.ITEM_UOM?.VIEW || "ITEM_UOM_VIEW");
  const canViewPackage = can(CAPABILITIES.PACKAGE?.VIEW || "PACKAGE_VIEW");
  const canViewStorage = can(CAPABILITIES.STORAGE?.VIEW || "STORAGE_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors text-sm">
      {itemConfig.columns.map((col, idx) => {
        if (col.showForSuperAdminOnly && !user?.isSuperAdmin) {
          return null;
        }

        const value = item[col.key];

        if (col.type === "image") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              <SharedImageZoom
                id={`item-table-${item.id}`}
                src={item.primaryImageUrl}
                alt={item.itemName}
                placeholderText={<Package size={18} />}
                thumbnailClassName="w-10 h-10 rounded-lg border border-gray-200 shrink-0"
              />
            </td>
          );
        }

        if (
          col.type === "link" ||
          col.key === "itemName" ||
          col.key === "categoryName" ||
          col.key === "companyName" ||
          col.key === "manufacturerName" ||
          col.key === "brandName" ||
          col.key === "storageName" ||
          col.key === "itemUomName" ||
          col.key === "packageUomName"
        ) {
          let hasPerm = canViewItem;
          let handler = setSelectedItemForDetails;
          let routeHref = "#";

          if (col.key === "categoryName") {
            hasPerm = canViewCategory;
            handler = setSelectedCategoryForDetails;
            if (item.categoryId) routeHref = buildRoute("item-category", "detail", { id: item.categoryId });
          } else if (col.key === "companyName") {
            hasPerm = canViewCompany;
            handler = setSelectedCompanyForDetails;
            if (item.companyId) routeHref = buildRoute("company", "detail", { id: item.companyId });
          } else if (col.key === "manufacturerName") {
            hasPerm = canViewManufacturer;
            handler = setSelectedManufacturerForDetails;
            if (item.manufacturerId) routeHref = buildRoute("manufacturer", "detail", { id: item.manufacturerId });
          } else if (col.key === "brandName") {
            hasPerm = canViewBrand;
            handler = setSelectedBrandForDetails;
            if (item.brandId) routeHref = buildRoute("brand", "detail", { id: item.brandId });
          } else if (col.key === "storageName") {
            hasPerm = canViewStorage;
            handler = setSelectedStorageForDetails;
            if (item.storageId) routeHref = buildRoute("storage", "detail", { id: item.storageId });
          } else if (col.key === "itemUomName") {
            hasPerm = canViewItemUom;
            handler = setSelectedItemUomForDetails;
            if (item.itemUomId) routeHref = buildRoute("item-uom", "detail", { id: item.itemUomId });
          } else if (col.key === "packageUomName") {
            hasPerm = canViewPackage;
            handler = setSelectedPackageForDetails;
            if (item.packageUomId) routeHref = buildRoute("package-master", "detail", { id: item.packageUomId });
          } else if (item.id) {
            routeHref = buildRoute("item", "detail", { id: item.id });
          }

          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              {hasPerm && handler ? (
                <ModuleLink
                  href={routeHref}
                  onClick={() => handler(item)}
                  className="font-medium text-[#1565c0]"
                >
                  {displayFormat(value)}
                </ModuleLink>
              ) : (
                <span className="font-medium text-gray-800">{displayFormat(value)}</span>
              )}
            </td>
          );
        }

        if (col.type === "statusBadge" || col.key === "status") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
                {displayFormat(value)}
              </span>
            </td>
          );
        }

        if (col.key === "itemCode" || col.key === "barcode") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              <span className="font-mono text-xs text-gray-700 bg-gray-50 ">
                {displayFormat(value)}
              </span>
            </td>
          );
        }

        if (col.key === "addedDateFormatted") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
              {displayFormat(value, "DATE")}
            </td>
          );
        }

        return (
          <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap text-gray-700">
            {displayFormat(value)}
          </td>
        );
      })}
    </tr>
  );
}
