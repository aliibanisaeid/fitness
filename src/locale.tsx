import { createContext, useContext } from 'react';
import type { Locale, Bilingual } from './content';
export const LocaleContext = createContext<Locale>('fa');
export function useLocale() {
  const lang = useContext(LocaleContext);
  return {
    lang, isFa: lang === 'fa', t: (fa: string, en: string) => lang === 'fa' ? fa : en,
    text: (value: Bilingual) => value[lang], path: (route = '') => `/${lang}${route}`,
    num: (n: number) => n.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US'),
    date: (value: string) => new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Tehran' }).format(new Date(value))
  };
}
