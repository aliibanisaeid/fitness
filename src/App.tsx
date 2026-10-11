import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LocaleContext } from './locale';
import type { Locale } from './content';
import { Footer, Header } from './components';
import Home from './Home';
import { Consultation, ProgramIntake } from './Forms';
import { ArticleDetail, CourseDetail, CourseList, Journal, NotFound, Privacy, ProgramDetail, Programs } from './Pages';
import { usePageMotion } from './motion';

export default function App() {
  const location = useLocation(); const lang: Locale = location.pathname.split('/')[1] === 'en' ? 'en' : 'fa';
  useEffect(() => {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    const page = location.pathname.split('/')[2] || 'home';
    const titles: Record<string, [string,string]> = { home: ['دوباره با اطمینان حرکت کن', 'Get back to moving'], programs: ['برنامهٔ آنلاین بازتوانی', 'Online rehabilitation programs'], start: ['درخواست برنامهٔ من', 'Your program request'], consultation: ['مشاورهٔ اختصاصی', 'Personal consultation'], courses: ['دوره‌های آموزشی', 'Learn to move better'], journal: ['مجلهٔ بازتوانی و حرکت', 'Rehabilitation research journal'], privacy: ['حریم خصوصی', 'Privacy'] };
    document.title = `${lang === 'fa' ? 'حرکت' : 'HARAKAT'} | ${(titles[page] || titles.home)[lang === 'fa' ? 0 : 1]}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', lang === 'fa' ? 'حرکت؛ برنامهٔ آنلاین بازتوانی، مشاورهٔ اختصاصی، دوره‌های آموزشی و پژوهش‌های تازه برای زندگی فعال' : 'HARAKAT: personal online rehabilitation, one-to-one consultations, foundation courses and recent research for a life in motion.');
    if (!location.hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [lang, location.pathname, location.hash]);
  usePageMotion(location.pathname);
  return <LocaleContext.Provider value={lang}><a href="#main" className="skip-link">{lang === 'fa' ? 'رفتن به محتوای اصلی' : 'Skip to content'}</a><Header/><main id="main"><Routes><Route path="/" element={<Navigate to="/fa" replace/>}/>{(['fa','en'] as Locale[]).map(locale=><Route path={`/${locale}`} key={locale}><Route index element={<Home/>}/><Route path="programs" element={<Programs/>}/><Route path="programs/:id" element={<ProgramDetail/>}/><Route path="start" element={<ProgramIntake/>}/><Route path="consultation" element={<Consultation/>}/><Route path="courses" element={<CourseList/>}/><Route path="courses/:id" element={<CourseDetail key={location.pathname.replace(/^\/(fa|en)/,'')}/>}/><Route path="journal" element={<Journal/>}/><Route path="journal/:id" element={<ArticleDetail/>}/><Route path="privacy" element={<Privacy/>}/></Route>)}<Route path="*" element={<NotFound/>}/></Routes></main><Footer/></LocaleContext.Provider>;
}
