"use client";

import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { resolvePath } from "@/components/core/dynamic-ui/utils/pathResolver";
import CellRenderer from "@/components/core/dynamic-ui/CellRenderer";

import SharedImageZoom from "@/components/common/SharedImageZoom";

export default function CompanyGridCard({ company, companyConfig, setSelectedCompanyForDetails }) {
  const router = useRouter();
  const { can } = useAuth();
  const hasViewPerm = can(companyConfig.permissions?.view || "COMPANY_VIEW");

  const config = companyConfig.gridCard;
  if (!config) return null;

  const logoUrl = resolvePath(company, config.header.image);
  const title = resolvePath(company, config.header.title);
  const subtitle = resolvePath(company, config.header.subtitle);
  const badgeValue = resolvePath(company, config.header.badge);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div 
          className={`flex items-center gap-3 ${hasViewPerm ? "cursor-pointer" : ""}`}
          onClick={() => hasViewPerm && setSelectedCompanyForDetails && setSelectedCompanyForDetails(company)}
        >
          <div className="relative shrink-0">
            <SharedImageZoom
              id={`company-grid-${company.id}`}
              src={logoUrl}
              alt={title}
              placeholderText={title?.[0] || "C"}
              thumbnailClassName="w-14 h-14 rounded-xl object-cover border border-gray-100"
              modalImageClassName="w-64 h-64 rounded-xl shadow-2xl"
            />
            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${badgeValue === "Active" ? "bg-green-500" : "bg-gray-300"}`}></div>
          </div>
          <div>
            <p className={`font-medium leading-tight mb-0.5 ${hasViewPerm ? "text-[#1565c0] hover:underline decoration-1 underline-offset-2" : "text-gray-900"}`}>
              {title || "—"}
            </p>
            <p className="text-gray-400 text-sm mt-2 leading-tight">
              {subtitle || "—"}
            </p>
          </div>
        </div>
        
        {/* <button className="text-gray-400 hover:text-gray-600 p-1">
          <MoreVertical size={18} />
        </button> */}
      </div>

      <hr className="border-gray-100 my-4" />

      <div className="space-y-3 text-sm">
        {config.details.map((detail, idx) => {
          const val = resolvePath(company, detail.key);
          if (!val) return null;
          
          return (
            <div key={idx} className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-gray-400">{ detail.label}</span>
              <span className="text-gray-900 truncate">
                <CellRenderer company={company} column={detail} companyConfig={companyConfig} />
              </span>
            </div>
          );
        })}
        {resolvePath(company, config.footer.date) && (
          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-gray-400">Created At</span>
            <span className="text-gray-900 truncate">{resolvePath(company, config.footer.date)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
