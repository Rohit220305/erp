import React from "react";
import { useAuth } from "@/context/AuthContext";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

export default function ActionRenderer({ item, actions, onActionClick }) {
  const { can } = useAuth();

  const allowedActions = actions.filter((action) => {
    return !action.permission || can(action.permission);
  });

  if (allowedActions.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      {allowedActions.map((action, idx) => {
        const Icon = action.type === "deleteModal" ? Trash2 : Edit;
        return (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              onActionClick(action, item);
            }}
            className={`flex items-center gap-1 text-xs font-medium hover:underline ${
              action.type === "deleteModal"
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            <Icon className="w-3 h-3" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
