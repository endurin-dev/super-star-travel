export const translations = {
  en: {
    "nav.home": "Home",
  },
  ru: {
    "nav.home": "Главная",
  },
} as const;

export type Lang = keyof typeof translations;
export type TKey = keyof typeof translations.en;
