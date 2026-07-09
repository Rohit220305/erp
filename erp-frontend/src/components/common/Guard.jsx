"use client";

import { useAuth } from "@/context/AuthContext";

export default function Guard({ permission, fallback = null, children }) {
  const { can } = useAuth();
  
  if (!can(permission)) {
    return fallback;
  }
  
  return children;
}
