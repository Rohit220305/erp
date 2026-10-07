"use client";

import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

export default function MaterialRequestTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedPlantForDetails,
  setSelectedUserForDetails,
  setSelectedOrderForDetails,
}) {
  const { can, user } = useAuth();
  const canView = can(CAPABILITIES.MATERIAL_REQUEST?.VIEW || "MATERIAL_REQUEST_VIEW");
  const canViewPlant = can(CAPABILITIES.PLANT?.VIEW || "PLANT_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");
  const canViewProductionRequest = can(
    CAPABILITIES.PRODUCTION_ORDER?.VIEW || "PRODUCTION_ORDER_VIEW",
  );

  const plantName = item?.plantName;
  const plantId = item?.plantId;
  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="  px-4 py-4 whitespace-nowrap">
        {canView ? (
          <ModuleLink
            href={buildRoute("material-request", "detail", { id: item?.id })}
            onClick={() => setSelectedItemForDetails?.(item)}
            className="text-[#1565c0] font-medium text-sm font-mono"
          >
            {displayFormat(item?.code)}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900 font-mono">
            {displayFormat(item?.code)}
          </span>
        )}
      </td>
      <td className="  px-4 py-4 whitespace-nowrap">
        {canViewProductionRequest && item?.productionOrderId ? (
          <ModuleLink
            href={buildRoute("production-order", "detail", {
              id: item?.productionOrderId,
            })}
            onClick={() =>
              setSelectedOrderForDetails?.({ id: item?.productionOrderId })
            }
            className="text-[#1565c0] font-medium text-sm"
          >
            {displayFormat(item?.productionOrderCode)}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {displayFormat(item?.productionOrderCode)}
          </span>
        )}
      </td>
      <td className=" px-4 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">
          {displayFormat(plantName)}
        </span>
      </td>
      <td className="  px-4 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-800">
          {displayFormat(item?.warehouseName)}
        </span>
      </td>
      <td className="  px-4 py-4 whitespace-nowrap">
        {item?.requestedBy && canViewUser && setSelectedUserForDetails ? (
          <ModuleLink
            href={buildRoute("user", "detail", { id: item.requestedBy })}
            onClick={() =>
              setSelectedUserForDetails?.({
                id: item.requestedBy,
                userId: item.requestedBy,
              })
            }
            className="text-[#1565c0] font-medium text-sm"
          >
            {displayFormat(item?.requestedByName)}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {displayFormat(item?.requestedByName)}
          </span>
        )}
      </td>
      <td className="  px-4 py-4 whitespace-nowrap">
        <span className="text-xs text-gray-500">
          {displayFormat(item?.requestedDateFormatted, "DATE")}
        </span>
      </td>
      <td className="  px-4 py-4 whitespace-nowrap">
        <StatusBadge status={item?.status} />
      </td>
    </tr>
  );
}
