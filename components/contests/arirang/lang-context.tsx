'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'ko' | 'en';

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ko');

  const value = useMemo(
    () => ({ lang, setLang }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const context = useContext(LangContext);

  if (!context) {
    throw new Error('useLang must be used within a LangProvider.');
  }

  return context;
}
