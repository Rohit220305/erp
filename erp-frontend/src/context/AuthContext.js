"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { backToSessionApi, switchProfile as switchProfileApi } from "@/lib/api/auth-api";

const AuthContext = createContext();

export function AuthProvider({ children, initialUser = null, initialCapabilities = [], initialIsImpersonating = false }) {
  const [user, setUser] = useState(() => {
    if (!initialUser) return null;
    return {
      ...initialUser,
      isSuperAdmin: Number(initialUser.isSuperAdmin) === 1,
      sub: initialUser.id || initialUser.sub,
    };
  });
  const [capabilities, setCapabilities] = useState(initialCapabilities || []);
  const [isImpersonating, setIsImpersonating] = useState(initialIsImpersonating || false);
  const [isInitializing, setIsInitializing] = useState(true);

  const [allGroups, setAllGroups] = useState(() => initialUser?.groups || []);
  const [activeGroupId, setActiveGroupId] = useState(() => initialUser?.groupId || null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsInitializing(false);
    }
  }, []);

  const setAuthData = (userData, userCapabilities = [], impersonatingStatus = false) => {
    const normalizedData = userData
      ? {
          ...userData,
          isSuperAdmin: Number(userData.isSuperAdmin) === 1,
          sub: userData.id || userData.sub,
        }
      : null;
    setUser(normalizedData);
    setCapabilities(userCapabilities);
    setIsImpersonating(impersonatingStatus || userData?.isImpersonating || false);
    setAllGroups(userData?.groups || []);
    setActiveGroupId(userData?.groupId || null);
  };

  const clearAuth = () => {
    setUser(null);
    setCapabilities([]);
    setIsImpersonating(false);
    setAllGroups([]);
    setActiveGroupId(null);
  };

  const can = (permission) => {
    if (user?.isSuperAdmin) return true;
    if (!capabilities || capabilities.length === 0) return false;
    return capabilities.includes(permission);
  };

  const login = (userData) => {
    setAuthData(userData, userData.capabilities || []);
  };

  const logout = () => {
    clearAuth();
  };

  const switchProfile = async (groupId) => {
    const res = await switchProfileApi(groupId);
    if (res?.success === 1 && res?.data) {
      const stillImpersonating =
        typeof res.data.isImpersonating !== "undefined"
          ? Boolean(res.data.isImpersonating)
          : isImpersonating;
      setAuthData(res.data, res.data.capabilities || [], stillImpersonating);
      return res;
    }
    throw new Error(res?.message || "Failed to switch profile");
  };

  const loginAs = (newUserData) => {
    setAuthData(newUserData, newUserData.capabilities || [], true);
  };

  const backToSession = async () => {
    const res = await backToSessionApi();
    if (!res || res.success !== 1) {
      logout();
      window.location.href = "/login";
      console.error("Failed to restore backend session:", res?.message);
      throw new Error(res?.message || "Failed to restore backend session");
    }

    setAuthData(res.data, res.data.capabilities, false);

    return res.data;
  };

  const isAuthenticated = !!user;
  const canImpersonate = user?.isSuperAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        capabilities,
        allGroups,
        activeGroupId,
        isAuthenticated,
        can,
        setAuthData,
        clearAuth,
        login,
        logout,
        switchProfile,
        loginAs,
        backToSession,
        isImpersonating,
        canImpersonate,
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}


