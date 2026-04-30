"use client";

import React, { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { isSearchEnabled } from "@/lib/search/searchUtil";

const SearchAvailabilityLiveContext = createContext(false);

function patchSearchAvailableOnWindow(): void {
  const w = window as AnyBecauseTodo;
  if (!w.publicInstanceSettings) w.publicInstanceSettings = {};
  w.publicInstanceSettings.elasticsearch = {
    ...(w.publicInstanceSettings.elasticsearch ?? {}),
    searchAvailable: true,
  };
}

export function SearchAvailabilityLiveProvider({ children }: { children: ReactNode }) {
  const [liveFromProbe, setLiveFromProbe] = useState(false);

  useLayoutEffect(() => {
    if (isSearchEnabled()) {
      setLiveFromProbe(true);
      patchSearchAvailableOnWindow();
    }
  }, []);

  useEffect(() => {
    if (isSearchEnabled()) {
      patchSearchAvailableOnWindow();
      return;
    }
    let canceled = false;
    void fetch("/api/elasticsearch-available", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { available: false }))
      .then((data: { available?: boolean }) => {
        if (canceled || data.available !== true) return;
        patchSearchAvailableOnWindow();
        setLiveFromProbe(true);
      })
      .catch(() => {});
    return () => {
      canceled = true;
    };
  }, []);

  const value = liveFromProbe || isSearchEnabled();
  return (
    <SearchAvailabilityLiveContext.Provider value={value}>
      {children}
    </SearchAvailabilityLiveContext.Provider>
  );
}

export function useSearchAvailabilityLive(): boolean {
  return useContext(SearchAvailabilityLiveContext) || isSearchEnabled();
}
