import React, { createContext, useContext, useState, ReactNode } from 'react';
import { t, Lang } from '@/constants/translations';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  tr: typeof t['en'];
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  tr: t.en,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  const toggleLang = () => setLang(prev => (prev === 'en' ? 'ar' : 'en'));

  return (
    <LanguageContext.Provider
      value={{
        lang,
        toggleLang,
        tr: t[lang],
        isRTL: lang === 'ar',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
