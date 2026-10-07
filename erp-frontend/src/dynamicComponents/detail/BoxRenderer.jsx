"use client";

import React from "react";
import FieldsBox from "./FieldsBox";
import AuditCard from "@/dynamicComponents/display/AuditCard";
import AuditUserCard from "@/dynamicComponents/display/AuditUserCard";
import { useAuth } from "@/context/AuthContext";

export default function BoxRenderer({ box, entityData, onOpenDrawer }) {
  const { can } = useAuth();

  if (box.permission && !can(box.permission)) {
    return null;
  }

  if (box.condition && !box.condition(entityData)) {
    return null;
  }

  switch (box.type) {
    case "fields":
      return <FieldsBox config={box} data={entityData} onOpenDrawer={onOpenDrawer} />;
    case "audit":
      return <AuditCard data={entityData} variant={box.variant} onOpenDrawer={onOpenDrawer} />;
    case "auditUser":
      return <AuditUserCard box={box} entityData={entityData} onOpenDrawer={onOpenDrawer} />;
    case "column":
      return (
        <div className={`flex flex-col gap-${box.gap || 6}`}>
          {box.boxes?.map((childBox) => (
            <BoxRenderer key={childBox.id} box={childBox} entityData={entityData} onOpenDrawer={onOpenDrawer} />
          ))}
        </div>
      );
    default:
      return <FieldsBox config={box} data={entityData} onOpenDrawer={onOpenDrawer} />;
  }
}

