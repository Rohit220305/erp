"use client";

import { createContext, useCallback, useContext, useState } from "react";

const HeaderContext = createContext();

const defaultConfig = {
  header: {
    actionButton: null,

    icons: [],

    showBookmark: true,

    showLanguage: true,

    showProfile: true,

    showMenu: true,
  },

  navbar: {
    title: "",

    breadcrumbs: [],
    actionButton: null,
  },
};

export function HeaderProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig);

  // useCallback ensures resetConfig has a stable reference across renders.
  // Without this, every render creates a new function → components that list
  // resetConfig in their useEffect dep array would re-run infinitely.
  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
  }, []); // defaultConfig is module-level constant — no deps needed

  return (
    <HeaderContext.Provider
      value={{
        config,
        setConfig,
        resetConfig,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  return useContext(HeaderContext);
}