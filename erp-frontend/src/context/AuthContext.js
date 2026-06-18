"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const SESSION_STACK_KEY = "sessionStack";
const USER_KEY = "user";
const TOKEN_KEY = "authToken";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sessionStack, setSessionStack] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedStack = localStorage.getItem(SESSION_STACK_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Normalize isSuperAdmin and ensure sub exists
      setUser({
        ...userData,
        isSuperAdmin: Number(userData.isSuperAdmin) === 1,
        sub: userData.id || userData.sub,
      });
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

    localStorage.setItem(USER_KEY, JSON.stringify(normalizedData));
    setUser(normalizedData);

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_STACK_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setSessionStack([]);
  };

  const loginAs = (newUserData, newToken = null) => {
    const newStack = [
      ...sessionStack,
      {
        user: user,
        token: localStorage.getItem(TOKEN_KEY),
      },
    ];

    const normalizedNewData = {
      ...newUserData,
      isSuperAdmin: Number(newUserData.isSuperAdmin) === 1,
      sub: newUserData.id || newUserData.sub,
    };

    localStorage.setItem(SESSION_STACK_KEY, JSON.stringify(newStack));
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedNewData));

    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    }

    setSessionStack(newStack);
    setUser(normalizedNewData);
  };

  const backToSession = async () => {
    if (sessionStack.length === 0) return null;

    const prevSession = sessionStack[sessionStack.length - 1];
    const newStack = sessionStack.slice(0, -1);

    // Restore previous user
    localStorage.setItem(USER_KEY, JSON.stringify(prevSession.user));
    setUser(prevSession.user);

    // Restore previous token if exists
    if (prevSession.token) {
      localStorage.setItem(TOKEN_KEY, prevSession.token);
    }

    // Update stack
    localStorage.setItem(SESSION_STACK_KEY, JSON.stringify(newStack));
    setSessionStack(newStack);

    return prevSession;
  };

  const isImpersonating = sessionStack.length > 0;
  const canImpersonate = user?.isSuperAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        user,
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
