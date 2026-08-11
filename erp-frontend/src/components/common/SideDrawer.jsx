"use client";
import { X } from "lucide-react";
import { useEffect } from "react";
import { formRegistry } from "@/config/forms/formRegistry";
import { drawerRegistry } from "@/config/drawers/drawerRegistry";
import { apiRegistry } from "@/config/apiRegistry";
import DetailDrawerContent from "@/components/common/dynamic/DetailDrawerContent";

export default function SideDrawer({ 
  open, 
  onClose, 
  title: customTitle, 
  width = "380px", 
  children,
  moduleName,
  mode,
  data,
  onSuccess
}) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose?.(); };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const drawerTitle = customTitle || (
    mode === "details"
      ? drawerRegistry[moduleName]?.title || "Details"
      : mode === "add"
      ? `Add ${moduleName}`
      : mode === "edit"
      ? `Edit ${moduleName}`
      : ""
  );

  const FormComponent = moduleName && (mode === "add" || mode === "edit") ? formRegistry[moduleName] : null;

  const renderContent = () => {
    if (children) return children;
    
    if (mode === "details" && moduleName) {
      const fetchFunction = apiRegistry[moduleName]?.fetchItem;
      return (
        <DetailDrawerContent
          open={open}
          onClose={onClose}
          item={data}
          moduleName={moduleName}
          fetchItem={fetchFunction}
        />
      );
    }

    if ((mode === "add" || mode === "edit") && FormComponent) {
      return (
        <FormComponent
          mode={mode === "add" ? "create" : "edit"}
          initialData={data}
          id={data?.id}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      );
    }
    
    return null;
  };

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 
      ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      
      <div onClick={onClose} 
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 
        ${open ? "opacity-100" : "opacity-0"}`} />

      <div style={{ maxWidth: width }}
        className={`absolute right-0 top-0 h-full w-full bg-white shadow-2xl 
        transition-transform duration-300 ease-in-out 
        ${open ? "translate-x-0" : "translate-x-full"}`}>
        
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5.5">
          <h2 className="text-xl font-semibold text-[#1565c0]">{drawerTitle}</h2>
          <button type="button" onClick={onClose} 
            className="rounded-full p-1 border border-gray-300 text-gray-500 hover:bg-gray-100 cursor-pointer transition">
            <X size={16} />
          </button>
        </div>

        <div className="flex h-[calc(100%-72px)] flex-col relative">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
