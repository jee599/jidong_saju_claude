"use client";

import { createContext, useContext, type ReactNode } from "react";
import { dictionary, type Locale, type Dictionary } from "./dictionary";

const LocaleContext = createContext<Locale>("ko");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useTranslations(): Dictionary {
  const locale = useContext(LocaleContext);
  return dictionary[locale];
}
