"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { drawerRegistry } from "@/config/drawers/drawerRegistry";

const getEntityId = (obj, moduleName) => {
  if (!obj) return null;
  if (obj.id) return obj.id;
  if (moduleName) {
    const dynamicId = moduleName.charAt(0).toLowerCase() + moduleName.slice(1) + "Id";
    if (obj[dynamicId]) return obj[dynamicId];
  }
  return null;
};

const getTitle = (titleConfig, data) => {
  if (!titleConfig || !data) return "Details";
  if (titleConfig.type === "compositeText") {
    return titleConfig.keys.map((k) => data[k]).filter(Boolean).join(titleConfig.separator || " ") || "Details";
  }
  return data[titleConfig.key] || "Details";
};

const getFieldValue = (field, data, user) => {
  if (field.condition && data[field.condition.key] !== field.condition.value) {
    return null;
  }
  if (field.showForSuperAdminOnly && !user?.isSuperAdmin) {
    return null;
  }
  if (field.type === "compositeText") {
    return field.keys.map((k) => data[k]).filter(Boolean).join(field.separator || " ") || "-";
  }
  const val = data[field.key];
  return (val !== null && val !== undefined && val !== "") ? String(val) : "-";
};


function HeaderImage({ imgConfig, data }) {
  const [imgError, setImgError] = useState(false);
  if (!imgConfig || !data) return null;

  const src = data[imgConfig.key];

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt="Logo"
        onError={() => setImgError(true)}
        className="w-14 h-14 rounded-full object-cover border border-gray-200 p-1"
      />
    );
  }

  if (imgConfig.fallbackType === "initials") {
    const initials = imgConfig.fallbackKeys?.map(k => data[k]?.[0] || "").join("").toUpperCase() || "?";
    return (
      <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium text-lg border border-gray-200">
        {initials}
      </div>
    );
  }

  if (imgConfig.fallbackType === "icon" && imgConfig.fallbackIcon) {
    const Icon = imgConfig.fallbackIcon;
    return (
      <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center font-medium border border-gray-200">
        <Icon size={26} />
      </div>
    );
  }
  return null;
}

function DetailField({ field, data, user }) {
  const displayValue = getFieldValue(field, data, user);
  if (displayValue === null) return null;

  return (
    <div className={field.fullWidth ? "col-span-2" : "col-span-1"}>
      <p className="text-xs text-gray-400 mb-1">{field.label}</p>
      <p className="font-medium break-words text-gray-800">{displayValue}</p>
    </div>
  );
}

function StatusBadge({ badgeConfig, data }) {
  if (!badgeConfig || !data[badgeConfig.key]) return null;

  const value = data[badgeConfig.key];
  const isActive = value === (badgeConfig.activeValue || "Active");
  const badgeColor = isActive ? "bg-[#2ecc71] text-white" : "bg-red-500 text-white";

  return (
    <span className={`mt-1 inline-block px-3 py-1 rounded-sm text-xs font-semibold ${badgeColor}`}>
      {value}
    </span>
  );
}

export default function DetailDrawerContent({ open, onClose, item, moduleName, fetchItem }) {
  const router = useRouter();
  const { can, user } = useAuth();

  const [isVisible, setIsVisible] = useState(false);
  const [delayedItem, setDelayedItem] = useState(null);

  const { execute, isLoading } = useAsyncAction();
  const drawerConfig = drawerRegistry[moduleName];
  const itemId = getEntityId(item, moduleName);

  useEffect(() => {
    if (!open) {
      setIsVisible(false);
      const timer = setTimeout(() => setDelayedItem(null), 300);
      return () => clearTimeout(timer);
    }

    if (!item) return;
    setDelayedItem(null);

    const loadData = async () => {
      if (!fetchItem || !itemId) {
        return setDelayedItem(item);
      }
      try {
        const res = await fetchItem({ id: itemId });
        const data = (res && (res.success !== 0 || res.settings?.success !== 0))
          ? (res.data || res.settings?.data || res)
          : item;
        setDelayedItem(data);
      } catch {
        setDelayedItem(item);
      }
    };

    execute(loadData);

    const animationTimer = setTimeout(() => requestAnimationFrame(() => setIsVisible(true)), 20);
    return () => clearTimeout(animationTimer);
  }, [open, item, itemId, fetchItem, execute]);

  const hasFullData = delayedItem && Object.keys(delayedItem).length > 1;

  if (open && (isLoading || !hasFullData)) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (!open && !delayedItem && !isLoading) return null;

  const hasViewPerm = drawerConfig?.primaryAction?.permission
    ? can(drawerConfig.primaryAction.permission)
    : true;

  const handleActionClick = () => {
    onClose?.();
    let path = drawerConfig.primaryAction.path;
    if (path.includes("{id}")) {
      path = path.replace("{id}", getEntityId(delayedItem, moduleName));
    }
    router.push(path);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 py-6">
      {(isLoading || (open && !delayedItem)) ? (
        <div className="flex h-full items-center justify-center"><Loader /></div>
      ) : delayedItem && drawerConfig ? (
        <>
          <div className="flex items-center gap-4 mb-6">
            <HeaderImage imgConfig={drawerConfig.header?.image} data={delayedItem} />
            <div>
              <p className="font-semibold text-lg text-gray-800">
                {getTitle(drawerConfig.header?.title, delayedItem)}
              </p>
              <StatusBadge badgeConfig={drawerConfig.header?.badge} data={delayedItem} />
            </div>
          </div>

          {hasViewPerm && drawerConfig.primaryAction && (
            <button onClick={handleActionClick} className="cursor-pointer w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-md transition mb-8">
              {drawerConfig.primaryAction.label || "More Details"}
            </button>
          )}

          <div className="flex flex-col gap-6">
            {drawerConfig.sections?.map((section, idx) => (
              <div key={idx}>
                {section.title && <h3 className="text-sm font-semibold text-gray-800 mb-3">{section.title}</h3>}
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  {section.fields.map((field, fIdx) => (
                    <DetailField key={fIdx} field={field} data={delayedItem} user={user} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <p>No details configuration found for this module.</p>
        </div>
      )}
    </div>
  );
}
