"use client";

import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccessDenied({ missingPermission }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-8 border border-gray-100 transition duration-300 hover:shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 border border-red-100 animate-pulse">
          <ShieldAlert size={32} className="text-red-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">403 - Access Denied</h2>
        
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          You do not have sufficient permissions to access this page or perform this action.
          {/* {missingPermission && (
            <span className="block mt-2 font-mono text-xs text-red-500 bg-red-50 py-1 px-2 rounded inline-block">
              Missing capability: {missingPermission}
            </span>
          )} */}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1565c0] hover:bg-[#0f57a6] rounded-lg transition duration-200 cursor-pointer shadow-sm"
          >
            <Home size={16} />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
