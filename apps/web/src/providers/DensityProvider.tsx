"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

type Density = "comfortable" | "compact";

interface DensityContextValue {
  density: Density;
  setDensity: (density: Density) => void;
  toggleDensity: () => void;
  isCompact: boolean;
}

const DensityContext = createContext<DensityContextValue | undefined>(undefined);

const DENSITY_STORAGE_KEY = "lore-density";

interface DensityProviderProps {
  children: ReactNode;
  defaultDensity?: Density;
}

export function DensityProvider({
  children,
  defaultDensity = "comfortable",
}: DensityProviderProps) {
  const [density, setDensityState] = useState<Density>(defaultDensity);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(DENSITY_STORAGE_KEY) as Density | null;
    if (stored && (stored === "comfortable" || stored === "compact")) {
      setDensityState(stored);
    }
  }, []);

  // Apply density class to html element
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    if (density === "compact") {
      html.classList.add("density-compact");
    } else {
      html.classList.remove("density-compact");
    }
  }, [density, mounted]);

  const setDensity = useCallback((newDensity: Density) => {
    setDensityState(newDensity);
    localStorage.setItem(DENSITY_STORAGE_KEY, newDensity);
  }, []);

  const toggleDensity = useCallback(() => {
    setDensity(density === "comfortable" ? "compact" : "comfortable");
  }, [density, setDensity]);

  const value: DensityContextValue = {
    density,
    setDensity,
    toggleDensity,
    isCompact: density === "compact",
  };

  return (
    <DensityContext.Provider value={value}>{children}</DensityContext.Provider>
  );
}

export function useDensity() {
  const context = useContext(DensityContext);
  if (context === undefined) {
    throw new Error("useDensity must be used within a DensityProvider");
  }
  return context;
}
