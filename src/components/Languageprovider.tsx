"use client";

/* ─────────────────────────────────────────────
   Put this file at  components/LanguageProvider.tsx
   and wrap the app with it in app/layout.tsx:

     <LanguageProvider>
       <Header />
       <main>{children}</main>
       <Footer />
     </LanguageProvider>

   Any client component can then do:
     const { lang, setLang, t } = useLanguage();
     t("nav.home")
   ───────────────────────────────────────────── */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Lang, type TKey } from "@/lib/translations";

const STORAGE_KEY = "ccl-lang";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TKey) => string;
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => translations.en[key],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  /* Always start in English so the server and first client render match, then switch once mounted. */
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* storage can be blocked */ }

    if (saved === "en" || saved === "ru") {
      setLangState(saved);
    } else if (navigator.language?.toLowerCase().startsWith("ru")) {
      /* First visit from a Russian-language browser */
      setLangState("ru");
    }
  }, []);

  /* Keep <html lang> correct for screen readers and search engines */
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t: (key) => translations[lang][key] ?? translations.en[key] }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);