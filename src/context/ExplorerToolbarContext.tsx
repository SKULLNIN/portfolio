"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** XP-style folder view modes (toolbar View menu). */
export type ExplorerViewMode =
  | "xlarge"
  | "tiles"
  | "icons"
  | "list"
  | "details";

/** Entries for Back / Forward dropdowns (IE-style history lists). */
export type ExplorerHistoryEntry = {
  label: string;
  onSelect: () => void;
};

export type ExplorerToolbarApi = {
  canBack: boolean;
  canForward: boolean;
  canUp: boolean;
  onBack: () => void;
  onForward: () => void;
  onUp: () => void;
  /** Recent locations behind current (newest first); powers ▼ next to Back. */
  backHistory: ExplorerHistoryEntry[];
  /** Locations ahead of current; powers ▼ next to Forward. */
  forwardHistory: ExplorerHistoryEntry[];
  addressPath: string;
  searchOpen: boolean;
  onSearchToggle: () => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  viewMode: ExplorerViewMode;
  onViewModeChange: (m: ExplorerViewMode) => void;
};

function defaultApi(addressPath: string): ExplorerToolbarApi {
  return {
    canBack: false,
    canForward: false,
    canUp: false,
    onBack: () => {},
    onForward: () => {},
    onUp: () => {},
    backHistory: [],
    forwardHistory: [],
    addressPath,
    searchOpen: false,
    onSearchToggle: () => {},
    searchQuery: "",
    onSearchQueryChange: () => {},
    viewMode: "tiles",
    onViewModeChange: () => {},
  };
}

type Ctx = {
  api: ExplorerToolbarApi;
  setApi: (patch: Partial<ExplorerToolbarApi> | null) => void;
};

const ExplorerToolbarContext = createContext<Ctx | null>(null);

export function ExplorerToolbarProvider({
  defaultAddress,
  children,
}: {
  defaultAddress: string;
  children: ReactNode;
}) {
  const [api, setApiState] = useState<ExplorerToolbarApi>(() =>
    defaultApi(defaultAddress),
  );

  const setApi = useCallback(
    (patch: Partial<ExplorerToolbarApi> | null) => {
      if (patch === null) {
        setApiState(defaultApi(defaultAddress));
      } else {
        setApiState((prev) => ({ ...prev, ...patch }));
      }
    },
    [defaultAddress],
  );

  const value = useMemo(() => ({ api, setApi }), [api, setApi]);

  return (
    <ExplorerToolbarContext.Provider value={value}>
      {children}
    </ExplorerToolbarContext.Provider>
  );
}

export function useExplorerToolbarOptional() {
  return useContext(ExplorerToolbarContext);
}
