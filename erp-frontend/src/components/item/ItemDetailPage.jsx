"use client";

import { CAPABILITIES } from "@/config/capabilities.config";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { Package } from "lucide-react";
import SideDrawer from "@/components/common/SideDrawer";

function DetailRow({ label, value, valueClassName = "", onClick }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      {onClick && value ? (
        <button
          type="button"
          onClick={onClick}
          className={`text-sm font-medium text-right text-[#1565c0] hover:underline cursor-pointer ${valueClassName}`}
        >
          {String(value)}
        </button>
      ) : (
        <span className={`text-sm font-medium text-right ${valueClassName}`}>
          {value !== null && value !== undefined && value !== "" ? String(value) : "-"}
        </span>
      )}
    </div>
  );
}

function UserInfoCard({ title, name, date, onClick }) {
  const initial = name ? name.charAt(0).toUpperCase() : "S";
  return (
    <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-5">{title}</h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#1565c0] text-white flex items-center justify-center text-lg font-semibold shadow-sm shrink-0">
          {initial}
        </div>
        <div className="flex flex-col">
          {onClick && name ? (
            <button
              type="button"
              onClick={onClick}
              className="text-sm font-semibold text-[#1565c0] hover:underline cursor-pointer text-left"
            >
              {name}
            </button>
          ) : (
            <span className="text-sm font-semibold text-[#1565c0]">
              {name || "System"}
            </span>
          )}
          <span className="text-xs text-gray-400 mt-1">
            {date || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ItemDetailPage({ data }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();

  const [selectedCategoryForDetails, setSelectedCategoryForDetails] = useState(null);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
  const [selectedManufacturerForDetails, setSelectedManufacturerForDetails] = useState(null);
  const [selectedBrandForDetails, setSelectedBrandForDetails] = useState(null);
  const [selectedItemUomForDetails, setSelectedItemUomForDetails] = useState(null);
  const [selectedPackageForDetails, setSelectedPackageForDetails] = useState(null);
  const [selectedStorageForDetails, setSelectedStorageForDetails] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  const canViewCategory = can(CAPABILITIES.ITEM_CATEGORY?.VIEW || "ITEM_CATEGORY_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");
  const canViewManufacturer = can(CAPABILITIES.MANUFACTURER?.VIEW || "MANUFACTURER_VIEW");
  const canViewBrand = can(CAPABILITIES.BRAND?.VIEW || "BRAND_VIEW");
  const canViewItemUom = can(CAPABILITIES.ITEM_UOM?.VIEW || "ITEM_UOM_VIEW");
  const canViewPackage = can(CAPABILITIES.PACKAGE?.VIEW || "PACKAGE_VIEW");
  const canViewStorage = can(CAPABILITIES.STORAGE?.VIEW || "STORAGE_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");

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
          { label: "Item Master", href: "/item" },
        ],
        actionButton: can(CAPABILITIES.ITEM?.UPDATE || "ITEM_UPDATE")
          ? {
              label: "Edit",
              onClick: () => router.push(`/item/edit/${data.id}`),
            }
          : null,
      },
    });
    return () => {
      resetConfig();
    };
  }, [setConfig, router, data?.id, resetConfig, can]);

  if (!data || data.success === 0 || data.settings?.success === 0) {
    if (data?.accessDenied) {
      return (
        <AccessDenied
          missingPermission={
            data.requiredPermission || CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW"
          }
        />
      );
    }
    return (
      <div className="p-6 text-gray-500">Item data could not be loaded.</div>
    );
  }

  const isActive = data.status === "Active" || data.status === "active";

  const weightText = data.weightDisplay || (data.weight ? `${data.weight} ${data.weightUomName || ''}`.trim() : null);
  const volumeText = data.volumeDisplay || (data.volume ? `${data.volume} ${data.volumeUomName || ''}`.trim() : null);
  const dimensionsText = (data.length || data.width || data.height)
    ? `${data.length || 0} × ${data.width || 0} × ${data.height || 0} ${data.dimensionUomName || ''}`.trim()
    : null;
  const shelfLifeText = data.shelfLifeDisplay || (data.shelfLife ? `${data.shelfLife} ${data.shelfLifeUnit || ''}`.trim() : null);
  const primitiveQuantityText = data.primitiveQuantityDisplay || (data.primitiveQuantity !== null && data.primitiveQuantity !== undefined ? (data.itemUomName ? `${data.primitiveQuantity} ${data.itemUomName}` : data.primitiveQuantity) : null);

  return (
    <div className=" py-6 mx-6     max-h-full overflow-y-auto">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-2">
          <div className="bg-white rounded-xl hover:shadow-lg transition p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-base text-gray-900">
                {data.itemName}
              </h2>
              <p className="text-gray-400 text-xs font-mono mt-0.5 uppercase">
                {data.itemCode}
              </p>
            </div>
            
            <hr className="my-4 border-gray-100" />
            
            <button className="w-full bg-[#1565c0] text-white py-2.5 px-4 rounded-lg text-sm font-medium transition hover:bg-[#0f57a6]">
              Summary
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-6">Basic Info & Classification</h3>
              
              <div className="flex items-center gap-4 mb-8">
                <SharedImageZoom
                  id={`detail-item-${data.id}`}
                  src={data.primaryImageUrl}
                  alt={data.itemName}
                  placeholderText={<Package size={24} className="text-[#1565c0]" />}
                  thumbnailClassName="w-16 h-16 rounded-lg border-4 border-blue-50 shadow-sm shrink-0 bg-gray-50 flex items-center justify-center object-contain"
                  objectFit="contain"
                />
                <div className="flex flex-col">
                  <h2 className="font-semibold text-base text-gray-900">
                    {data.itemName}
                  </h2>
                  <span className="text-xs font-mono text-gray-400 uppercase mt-0.5">
                    {data.itemCode}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <DetailRow label="Item Name" value={data.itemName} />
                <DetailRow label="Item Code" value={data.itemCode} />
                <DetailRow label="Short Name" value={data.shortName} />
                <DetailRow label="Print Name" value={data.printName} />
                <DetailRow label="Barcode" value={data.barcode} />
                <DetailRow label="Vendor Barcode" value={data.vendorBarcode} />
                <DetailRow label="Reference Code" value={data.referenceCode} />
                <DetailRow
                  label="Company"
                  value={data.companyName}
                  onClick={canViewCompany && data?.companyId ? () => setSelectedCompanyForDetails({ companyId: data.companyId }) : null}
                />
                <DetailRow
                  label="Category"
                  value={data.categoryName}
                  onClick={canViewCategory && data?.categoryId ? () => setSelectedCategoryForDetails({ categoryId: data.categoryId }) : null}
                />
                <DetailRow
                  label="Manufacturer"
                  value={data.manufacturerName}
                  onClick={canViewManufacturer && data?.manufacturerId ? () => setSelectedManufacturerForDetails({ manufacturerId: data.manufacturerId }) : null}
                />
                <DetailRow
                  label="Brand"
                  value={data.brandName}
                  onClick={canViewBrand && data?.brandId ? () => setSelectedBrandForDetails({ brandId: data.brandId }) : null}
                />
                <DetailRow label="Usage Type" value={data.usageType} />
                <DetailRow label="Inventory Type" value={data.inventoryType} />
                <DetailRow 
                  label="Status" 
                  value={data.status} 
                  valueClassName={isActive ? "text-green-500 font-semibold" : "text-red-500 font-semibold"} 
                />
              </div>
            </div>

            <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-6">Units, Pricing & Attributes</h3>
              
              <div className="space-y-1">
                <DetailRow
                  label="Item Base UOM"
                  value={data.itemUomName}
                  onClick={canViewItemUom && data?.itemUomId ? () => setSelectedItemUomForDetails({ itemUomId: data.itemUomId }) : null}
                />
                <DetailRow
                  label="Package UOM"
                  value={data.packageUomName}
                  onClick={canViewPackage && data?.packageUomId ? () => setSelectedPackageForDetails({ packageId: data.packageUomId }) : null}
                />
                <DetailRow label="Units Per Packing" value={data.unitsPerPacking} />
                <DetailRow label="Primitive Quantity" value={primitiveQuantityText} />
                <DetailRow label="Decimal Allowed" value={data.isDecimalAllowed} />
                <DetailRow label="Currency" value={data.currencyCode ? `${data.currencyCode} (${data.currencyName || ''})`.trim() : null} />
                <DetailRow label="Purchase Price" value={data.purchasePrice} />
                <DetailRow label="Cost Price" value={data.costPrice} />
                <DetailRow label="Cost Per Unit" value={data.costPerUnit} />
                <DetailRow
                  label="Storage"
                  value={data.storageName}
                  onClick={canViewStorage && data?.storageId ? () => setSelectedStorageForDetails({ storageId: data.storageId }) : null}
                />
                <DetailRow label="Weight" value={weightText} />
                <DetailRow label="Volume" value={volumeText} />
                <DetailRow label="Dimensions (L×W×H)" value={dimensionsText} />
                <DetailRow label="Shelf Life" value={shelfLifeText} />
                <DetailRow label="Batch Code" value={data.batchCode} />
                <DetailRow label="Is Scrap" value={data.isScrap} />
                <DetailRow label="Description" value={data.description} />
                <DetailRow label="Remark" value={data.remark} />
              </div>
            </div>

            <div className="xl:col-span-1 flex flex-col gap-6">
              <UserInfoCard
                title="Added Info"
                name={data.addedByName}
                date={data.addedDateFormatted}
                onClick={canViewUser && data?.addedBy ? () => setSelectedUserForDetails({ userId: data.addedBy }) : null}
              />
              <UserInfoCard
                title="Modified Info"
                name={data.updatedByName}
                date={data.updatedDateFormatted}
                onClick={canViewUser && data?.updatedBy ? () => setSelectedUserForDetails({ userId: data.updatedBy }) : null}
              />

              {data.images && data.images.length > 0 && (
                <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-4">Item Images</h3>
                  <div className="flex flex-wrap gap-3">
                    {data.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-lg overflow-hidden border bg-gray-50 shrink-0 ${
                          img.isPrimary === 'Yes' ? 'border-blue-500 border-2 shadow-sm' : 'border-gray-200'
                        }`}
                      >
                        <SharedImageZoom
                          id={`item-gallery-${img.id || idx}`}
                          src={img.url}
                          alt={`Gallery ${idx}`}
                          thumbnailClassName="w-24 h-24 object-cover block"
                          objectFit="cover"
                        />
                        {img.isPrimary === 'Yes' && (
                          <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase z-10 shadow-sm pointer-events-none">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <SideDrawer
        open={!!selectedCategoryForDetails}
        onClose={() => setSelectedCategoryForDetails(null)}
        moduleName="ItemCategory"
        mode="details"
        data={selectedCategoryForDetails ? { id: selectedCategoryForDetails.categoryId } : null}
      />

      <SideDrawer
        open={!!selectedCompanyForDetails}
        onClose={() => setSelectedCompanyForDetails(null)}
        moduleName="Company"
        mode="details"
        data={selectedCompanyForDetails ? { id: selectedCompanyForDetails.companyId } : null}
      />

      <SideDrawer
        open={!!selectedManufacturerForDetails}
        onClose={() => setSelectedManufacturerForDetails(null)}
        moduleName="Manufacturer"
        mode="details"
        data={selectedManufacturerForDetails ? { id: selectedManufacturerForDetails.manufacturerId } : null}
      />

      <SideDrawer
        open={!!selectedBrandForDetails}
        onClose={() => setSelectedBrandForDetails(null)}
        moduleName="Brand"
        mode="details"
        data={selectedBrandForDetails ? { id: selectedBrandForDetails.brandId } : null}
      />

      <SideDrawer
        open={!!selectedItemUomForDetails}
        onClose={() => setSelectedItemUomForDetails(null)}
        moduleName="ItemUom"
        mode="details"
        data={selectedItemUomForDetails ? { id: selectedItemUomForDetails.itemUomId } : null}
      />

      <SideDrawer
        open={!!selectedPackageForDetails}
        onClose={() => setSelectedPackageForDetails(null)}
        moduleName="PackageMaster"
        mode="details"
        data={selectedPackageForDetails ? { id: selectedPackageForDetails.packageId } : null}
      />

      <SideDrawer
        open={!!selectedStorageForDetails}
        onClose={() => setSelectedStorageForDetails(null)}
        moduleName="Storage"
        mode="details"
        data={selectedStorageForDetails ? { id: selectedStorageForDetails.storageId } : null}
      />

      <SideDrawer
        open={!!selectedUserForDetails}
        onClose={() => setSelectedUserForDetails(null)}
        moduleName="User"
        mode="details"
        data={selectedUserForDetails ? { id: selectedUserForDetails.userId } : null}
      />
    </div>
  );
}
