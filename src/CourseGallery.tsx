import { useEffect, useRef, useState } from 'react';
import type { FocusEvent } from 'react';
import { Pause, Play } from 'lucide-react';
import type { Course } from './content';
import { CourseCard } from './components';
import { useLocale } from './locale';

export default function CourseGallery({ courses }: { courses: Course[] }) {
  const { t, isFa } = useLocale();
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [keyboard, setKeyboard] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => setReduced(media.matches);
    const visibility = () => setPageVisible(!document.hidden);
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { threshold: 0.1 });
    observer.observe(element);
    media.addEventListener('change', preference);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); media.removeEventListener('change', preference); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  function focus(e: FocusEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).matches(':focus-visible')) setKeyboard(true);
  }
  const running = visible && pageVisible && !paused && !reduced && !keyboard;
  return <div ref={root} className={`course-loop ${running ? 'is-running' : ''} ${keyboard || reduced ? 'is-static' : ''}`} onFocusCapture={focus} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setKeyboard(false); }}>
    <div className="course-loop-window" aria-label={t('گالری دوره‌های آموزشی', 'Foundation courses gallery')}>
      <div className="course-loop-track">
        {[false, true].map(duplicate => <div className={`course-loop-group ${duplicate ? 'loop-copy' : ''}`} key={String(duplicate)} dir={isFa ? 'rtl' : 'ltr'} aria-hidden={duplicate || undefined}>
          {courses.map(course => <CourseCard key={course.id} course={course} decorative={duplicate}/>)}
        </div>)}
      </div>
    </div>
    <div className="course-loop-tools"><span>{t('از شناخت بدن، تا بازگشت به فعالیت', 'From understanding your body to getting back to life')}</span>{!reduced && <button className="gallery-control" onClick={() => setPaused(p => !p)} aria-pressed={paused} aria-label={paused ? t('پخش حرکت گالری', 'Play gallery motion') : t('توقف حرکت گالری', 'Pause gallery motion')}>{paused ? <Play size={14} fill="currentColor"/> : <Pause size={14} fill="currentColor"/>}<span>{paused ? t('پخش گالری', 'Play gallery') : t('توقف گالری', 'Pause gallery')}</span></button>}</div>
  </div>;
}
