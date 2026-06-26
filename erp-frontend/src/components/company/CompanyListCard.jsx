"use client";

import { useState } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompanyListCard({ company }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  return (
    <div className=" px-4 py-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-400 shadow-sm hover:shadow-md">
        <div 
          className="flex items-center px-6 py-4"
        >
          {/* Col 1: Company Name */}
          <div className="flex-[1.5]">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">Company</p>
              <div className="flex items-center gap-3">
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.companyName}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1565c0]/10 to-[#1565c0]/20 flex items-center justify-center border border-[#1565c0]/15 shrink-0">
                    <Building2 size={18} className="text-[#1565c0]" />
                  </div>
                )}
                <div>
                  <p 
                    className="text-sm font-semibold text-[#1565c0] hover:underline cursor-pointer w-fit"
                    onClick={() => router.push(`/company/${company.id}`)}
                  >
                    {company.companyName || "—"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{company.companyCode || company.shortName || "—"}</p>
                </div>
              </div>
          </div>
          
          {/* Col 2: Email */}
          <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">Email</p>
              <p className="text-[13px] text-gray-800 font-medium">{company.email || "—"}</p>
          </div>
          
          {/* Col 3: Phone */}
          <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">Phone</p>
              <p className="text-[13px] text-gray-800 font-medium">
                {company.phone ? `${company.dialCode || ""} ${company.phone}` : "—"}
              </p>
          </div>
          
          {/* Col 4: Status */}
          <div className="flex-[1.5]">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">Status</p>
              <span className={`px-3 py-1 rounded text-[11px] font-semibold ${
                company.status === "Active" ? "bg-[#2ecc71] text-white" : "bg-red-500 text-white"
              }`}>
                {company.status || "—"}
              </span>
          </div>

          {/* Chevron */}
          <div 
            className="ml-4 flex items-center justify-center cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown className={`text-[#1565c0] transition-transform duration-400 ${isExpanded ? "rotate-180" : ""}`} size={20} />
          </div>
        </div>

        {/* Expanded Content */}
        <div 
          className={`transition-all duration-400 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[500px] opacity-100 " : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-5 flex items-start bg-white">
              {/* Col 1: Legal Name */}
              <div className="flex-[1.5]">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">Legal Name</p>
                <p className="text-[13px] text-gray-800 font-medium">{company.legalName || "—"}</p>
              </div>
              
              {/* Col 2: Registration No. */}
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">Registration No.</p>
                <p className="text-[13px] text-gray-800 font-medium">{company.registrationNumber || "—"}</p>
              </div>
              
              {/* Col 3: Contact Person */}
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">Contact Person</p>
                <p className="text-[13px] text-gray-800 font-medium">{company.contactPersonName || "—"}</p>
              </div>
              
              {/* Col 4: Added Date */}
              <div className="flex-[1.5]">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">Added Date</p>
                <p className="text-[13px] text-gray-800 font-medium">{company.addedDateFormatted || "—"}</p>
              </div>
              
              {/* Spacer for Chevron alignment */}
              <div className="ml-4 w-5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
