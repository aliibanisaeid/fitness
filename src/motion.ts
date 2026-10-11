import { useEffect } from 'react';

const revealSelector = '.section-heading,.services-intro,.service,.featured-program,.plan-panel,.course-gallery-reveal,.course-card,.motion-copy,.consultation-visual,.consultation-copy,.weekly-banner,.article-card,.faq-intro,.faq-list,.closing-cta,.page-intro,.program-card,.detail-hero,.process-grid>div,.course-detail-intro,.lesson-sidebar,.lesson-reading,.article-detail-top,.article-body,.consultation-page-intro,.consultation-form,.legal-page';
const cardSelector = '.service,.course-card,.article-card,.program-card';

export function usePageMotion(route: string) {
  useEffect(() => {
    const root = document.documentElement;
    const main = document.getElementById('main');
    if (!main) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 900px)');
    const elements = new Set<HTMLElement>();
    let frame = 0;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.04, rootMargin: '0px 0px -35px 0px' });

    function register() {
      elements.forEach(element => {
        if (!element.isConnected) { observer.unobserve(element); elements.delete(element); }
      });
      main!.querySelectorAll<HTMLElement>(revealSelector).forEach(element => {
        if (element.matches('.course-card') && element.closest('.course-loop')) return;
        if (elements.has(element)) return;
        elements.add(element);
        if (reduced.matches) return;
        const siblings = Array.from(element.parentElement?.children ?? []).filter(e => e.matches(cardSelector));
        const delay = element.matches(cardSelector) ? Math.min(Math.max(siblings.indexOf(element), 0), 2) * 75 : 0;
        element.style.setProperty('--motion-delay', `${delay}ms`);
        const rect = element.getBoundingClientRect();
        element.classList.add('reveal-ready');
        if (rect.top < innerHeight - 35) element.classList.add('in-view');
        else observer.observe(element);
      });
    }

    function update() {
      frame = 0;
      root.classList.toggle('is-scrolled', scrollY > 18);
      const hero = main!.querySelector<HTMLElement>('.hero');
      const motion = main!.querySelector<HTMLElement>('.motion-section');
      const plan = main!.querySelector<HTMLElement>('.plan-showcase');
      const hasDepth = desktop.matches && !reduced.matches;
      if (hero) {
        const amount = hasDepth ? Math.min(1, Math.max(0, scrollY / hero.offsetHeight)) : 0;
        hero.style.setProperty('--hero-side-shift', `${-amount * 16}px`);
        hero.style.setProperty('--hero-angle', `${5 - amount * 3}deg`);
        hero.style.setProperty('--hero-image-shift', `${amount * 7}px`);
      }
      if (plan) {
        const rect = plan.getBoundingClientRect();
        const progress = hasDepth ? Math.min(1, Math.max(0, (innerHeight - rect.top) / (innerHeight + rect.height))) : 0.5;
        plan.style.setProperty('--phone-shift', `${(0.5 - progress) * 32}px`);
      }
      if (motion) {
        const rect = motion.getBoundingClientRect();
        const amount = hasDepth ? Math.min(1, Math.max(0, (innerHeight - rect.top) / (innerHeight + rect.height))) : 0.5;
        motion.style.setProperty('--film-shift', `${(amount - 0.5) * 34}px`);
      }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const preferenceChanged = () => {
      observer.disconnect();
      elements.forEach(element => {
        if (reduced.matches) element.classList.add('in-view');
        else if (!element.classList.contains('in-view')) observer.observe(element);
      });
      schedule();
    };
    register(); update();
    const mutations = new MutationObserver(register);
    mutations.observe(main, { childList: true, subtree: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    reduced.addEventListener('change', preferenceChanged);
    return () => {
      observer.disconnect(); mutations.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', preferenceChanged);
      elements.forEach(element => { element.classList.remove('reveal-ready', 'in-view'); element.style.removeProperty('--motion-delay'); });
    };
  }, [route]);
}
