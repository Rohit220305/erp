"use client";

import { createContext, useContext, useState } from "react";

const ListingContext = createContext();

export function ListingProvider({ children }) {
  const [view, setView] = useState("table");

  return (
    <ListingContext.Provider
      value={{
        view,
        setView,
      }}
    >
      {children}
    </ListingContext.Provider>
  );
}

export function useListing() {
  return useContext(ListingContext);
}
