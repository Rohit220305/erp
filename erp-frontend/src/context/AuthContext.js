"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { restoreSession } from "@/lib/api/auth-api";

const AuthContext = createContext();

const SESSION_STACK_KEY = "sessionStack";
const USER_KEY = "user";
const TOKEN_KEY = "authToken";
const CAPABILITIES_KEY = "capabilities";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [capabilities, setCapabilities] = useState([]);
  const [sessionStack, setSessionStack] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedStack = localStorage.getItem(SESSION_STACK_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedCapabilities = localStorage.getItem(CAPABILITIES_KEY);

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Normalize isSuperAdmin and ensure sub exists
      setUser({
        ...userData,
        isSuperAdmin: Number(userData.isSuperAdmin) === 1,
        sub: userData.id || userData.sub,
      });
    }
    if (storedCapabilities) {
      setCapabilities(JSON.parse(storedCapabilities));
    }
    if (storedStack) {
      setSessionStack(JSON.parse(storedStack));
    }
    setIsInitializing(false);
  }, []);

  const login = (userData, token = null) => {
    const normalizedData = {
      ...userData,
      isSuperAdmin: Number(userData.isSuperAdmin) === 1,
      sub: userData.id || userData.sub,
    };
    const caps = userData.capabilities || [];

    localStorage.setItem(USER_KEY, JSON.stringify(normalizedData));
    localStorage.setItem(CAPABILITIES_KEY, JSON.stringify(caps));
    setUser(normalizedData);
    setCapabilities(caps);

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_STACK_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CAPABILITIES_KEY);
    setUser(null);
    setCapabilities([]);
    setSessionStack([]);
  };

  const loginAs = (newUserData, newToken = null) => {
    const newStack = [
      ...sessionStack,
      {
        user: user,
        capabilities: capabilities,
        token: localStorage.getItem(TOKEN_KEY),
      },
    ];

    const normalizedNewData = {
      ...newUserData,
      isSuperAdmin: Number(newUserData.isSuperAdmin) === 1,
      sub: newUserData.id || newUserData.sub,
    };
    const caps = newUserData.capabilities || [];

    localStorage.setItem(SESSION_STACK_KEY, JSON.stringify(newStack));
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedNewData));
    localStorage.setItem(CAPABILITIES_KEY, JSON.stringify(caps));

    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    }

    setSessionStack(newStack);
    setUser(normalizedNewData);
    setCapabilities(caps);
  };

  const backToSession = async () => {
    if (sessionStack.length === 0) return null;

    const prevSession = sessionStack[sessionStack.length - 1];
    const newStack = sessionStack.slice(0, -1);

    if (prevSession.token) {
      const res = await restoreSession(prevSession.token);
      if (!res || res.success !== 1) {
        throw new Error(res?.message || "Failed to restore backend session");
      }
    }

    // Restore previous user
    localStorage.setItem(USER_KEY, JSON.stringify(prevSession.user));
    setUser(prevSession.user);

    // Restore previous capabilities
    const prevCaps = prevSession.capabilities || [];
    localStorage.setItem(CAPABILITIES_KEY, JSON.stringify(prevCaps));
    setCapabilities(prevCaps);

    // Restore previous token if exists
    if (prevSession.token) {
      localStorage.setItem(TOKEN_KEY, prevSession.token);
    }

    // Update stack
    localStorage.setItem(SESSION_STACK_KEY, JSON.stringify(newStack));
    setSessionStack(newStack);

    return prevSession;
  };

  const can = (permission) => {
    if (user?.isSuperAdmin) return true;
    if (!capabilities || capabilities.length === 0) return false;
    return capabilities.includes(permission);
  };

  const isImpersonating = sessionStack.length > 0;
  const canImpersonate = user?.isSuperAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        capabilities,
        can,
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

