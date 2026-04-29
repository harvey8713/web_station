'use client';

import { createContext, useContext } from 'react';
import type { GlobalSettings } from '@/lib/api';

const GlobalContext = createContext<GlobalSettings | null>(null);

export function GlobalProvider({
  value,
  children,
}: {
  value: GlobalSettings | null;
  children: React.ReactNode;
}) {
  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export function useGlobal() {
  return useContext(GlobalContext);
}
