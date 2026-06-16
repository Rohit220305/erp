"use client";

import { createContext, useContext, useState } from "react";

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

  const resetConfig = () => {
    setConfig(defaultConfig);
  };

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