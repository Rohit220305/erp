"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const SESSION_STACK_KEY = "sessionStack";
const USER_KEY = "user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  /**
   * sessionStack stores the array of previous sessions when super admin
   * is impersonating another user. Each entry: { user: {...} }
   */
  const [sessionStack, setSessionStack] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedStack = localStorage.getItem(SESSION_STACK_KEY);
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedStack) setSessionStack(JSON.parse(storedStack));
  }, []);

  /** Called after POST /auth/login succeeds — stores user metadata only */
  const login = (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  /** Called after POST /auth/logout — clears local user */
  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_STACK_KEY);
    setUser(null);
    setSessionStack([]);
  };

  /**
   * loginAs — push current session to stack, set new user.
   * Tokens are already updated in httpOnly cookie by backend.
   */
  const loginAs = (newUserData) => {
    const newStack = [...sessionStack, { user }];
    localStorage.setItem(SESSION_STACK_KEY, JSON.stringify(newStack));
    localStorage.setItem(USER_KEY, JSON.stringify(newUserData));
    setSessionStack(newStack);
    setUser(newUserData);
  };

  /**
   * backToSession — pops last session. Since we can't restore original
   * cookies without backend support, we logout (clears impersonation)
   * and redirect to /login. The caller should handle the redirect.
   */
  const backToSession = () => {
    // Pop most recent previous user metadata for display only
    const prevSession = sessionStack[sessionStack.length - 1];
    const newStack = sessionStack.slice(0, -1);
    localStorage.setItem(SESSION_STACK_KEY, JSON.stringify(newStack));
    setSessionStack(newStack);
    return prevSession?.user || null;
  };

  const isImpersonating = sessionStack.length > 0;

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
