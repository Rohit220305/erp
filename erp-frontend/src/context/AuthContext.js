"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { restoreSession } from "@/lib/api/auth-api";

const AuthContext = createContext();

export function AuthProvider({ children, initialUser = null, initialCapabilities = [] }) {
  const [user, setUser] = useState(() => {
    if (!initialUser) return null;
    return {
      ...initialUser,
      isSuperAdmin: Number(initialUser.isSuperAdmin) === 1,
      sub: initialUser.id || initialUser.sub,
    };
  });
  const [capabilities, setCapabilities] = useState(initialCapabilities || []);
  const [sessionStack, setSessionStack] = useState([]);
  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load session stack and tokens on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedStack = localStorage.getItem("sessionStack");
      if (storedStack) {
        try {
          setSessionStack(JSON.parse(storedStack));
        } catch (e) {
          console.error("Failed to parse sessionStack from localStorage", e);
        }
      }
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        setToken(storedToken);
      }
      setIsInitializing(false);
    }
  }, []);

  const setAuthData = (userData, userCapabilities = []) => {
    const normalizedData = userData
      ? {
          ...userData,
          isSuperAdmin: Number(userData.isSuperAdmin) === 1,
          sub: userData.id || userData.sub,
        }
      : null;
    setUser(normalizedData);
    setCapabilities(userCapabilities);
    localStorage.setItem("userCapabilities", userCapabilities);
  };

  const clearAuth = () => {
    setUser(null);
    setCapabilities([]);
    setSessionStack([]);
    setToken(null);
  };

  const can = (permission) => {
    if (user?.isSuperAdmin) return true;
    if (!capabilities || capabilities.length === 0) return false;
    return capabilities.includes(permission);
  };

  const login = (userData, userToken = null) => {
    setAuthData(userData, userData.capabilities || []);
    if (userToken) {
      setToken(userToken);
      localStorage.setItem("authToken", userToken);
    }
  };

  const logout = () => {
    clearAuth();
    localStorage.removeItem("sessionStack");
    localStorage.removeItem("authToken");
  };

  const loginAs = (newUserData, newToken = null) => {
    const currentToken = localStorage.getItem("authToken") || token;
    const newStack = [
      ...sessionStack,
      {
        user: user,
        capabilities: capabilities,
        token: currentToken,
      },
    ];

    setSessionStack(newStack);
    localStorage.setItem("sessionStack", JSON.stringify(newStack));

    setAuthData(newUserData, newUserData.capabilities || []);
    if (newToken) {
      setToken(newToken);
      localStorage.setItem("authToken", newToken);
    }
  };

  const backToSession = async () => {
    if (sessionStack.length === 0) return null;

    const prevSession = sessionStack[sessionStack.length - 1];
    const newStack = sessionStack.slice(0, -1);
    
    if (prevSession.token) {
      const res = await restoreSession(prevSession.token);
      if (!res || res.success !== 1) {
        logout();
        window.location.href = "/login";
        throw new Error(res?.message || "Failed to restore backend session");
      }
    }

    setSessionStack(newStack);
    localStorage.setItem("sessionStack", JSON.stringify(newStack));

    setAuthData(prevSession.user, prevSession.capabilities);
    if (prevSession.token) {
      setToken(prevSession.token);
      localStorage.setItem("authToken", prevSession.token);
    } else {
      setToken(null);
      localStorage.removeItem("authToken");
    }

    return prevSession;
  };

  const isAuthenticated = !!user;
  const isImpersonating = sessionStack.length > 0;
  const canImpersonate = user?.isSuperAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        capabilities,
        isAuthenticated,
        can,
        setAuthData,
        clearAuth,
        login,
        logout,
        loginAs,
        backToSession,
        sessionStack,
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


