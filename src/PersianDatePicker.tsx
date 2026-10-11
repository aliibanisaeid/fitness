import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from './locale';
import { isoDate, movePersianMonth, persianDateLabel, persianMonth, persianMonthGrid, persianMonthName, shiftDays } from './persianCalendar.mjs';

export default function PersianDatePicker({ value, onChange, min, max }: {
  value: string; onChange: (date: string) => void; min: string; max: string;
}) {
  const { t, lang, isFa, num } = useLocale();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(value || min);
  const [cursor, setCursor] = useState(value || min);
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const month = persianMonth(cursor);
  const year = month.year.toLocaleString(isFa ? 'fa-IR' : 'en-US', { useGrouping: false });
  const previous = persianMonth(shiftDays(month.first, -1));
  const following = persianMonth(month.next);
  const weekdays = isFa ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dayNames = isFa ? ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'] : ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const clamp = (date: string) => date < min ? min : date > max ? max : date;

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  useEffect(() => {
    if (open) grid.current?.querySelector<HTMLButtonElement>(`[data-date="${active}"]`)?.focus();
  }, [open, active]);

  function choose(date: string) {
    onChange(date); setOpen(false); trigger.current?.focus();
  }
  function navigate(direction: number) {
    const target = clamp(movePersianMonth(active, direction));
    setCursor(target); setActive(target);
  }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, date: string) {
    let target: string | undefined;
    if (event.key === 'ArrowLeft') target = shiftDays(date, isFa ? 1 : -1);
    if (event.key === 'ArrowRight') target = shiftDays(date, isFa ? -1 : 1);
    if (event.key === 'ArrowUp') target = shiftDays(date, -7);
    if (event.key === 'ArrowDown') target = shiftDays(date, 7);
    const weekday = (isoDate(date).getUTCDay() + 1) % 7;
    if (event.key === 'Home') target = shiftDays(date, -weekday);
    if (event.key === 'End') target = shiftDays(date, 6 - weekday);
    if (event.key === 'PageUp') target = movePersianMonth(date, -1);
    if (event.key === 'PageDown') target = movePersianMonth(date, 1);
    if (!target) return;
    event.preventDefault(); target = clamp(target); setCursor(target); setActive(target);
  }

  return <div ref={root} className="persian-date-field" onBlurCapture={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={event => {
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
  }}>
    <label id="consultation-date-label" htmlFor="consultation-date">{t('تاریخ پیشنهادی', 'Preferred date')}</label>
    <button ref={trigger} id="consultation-date" type="button" className={`date-trigger ${value ? 'has-date' : ''}`} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? 'persian-calendar' : undefined} aria-labelledby="consultation-date-label consultation-date-value" onClick={() => {
      const date = clamp(value || min); setCursor(date); setActive(date); setOpen(current => !current);
    }}><span id="consultation-date-value">{value ? persianDateLabel(value, lang) : t('انتخاب تاریخ شمسی', 'Choose a Solar Hijri date')}</span><CalendarDays size={18}/></button>
    <input type="hidden" name="date" value={value}/>
    {open && <div id="persian-calendar" className="persian-calendar" role="dialog" aria-label={t('تقویم هجری خورشیدی', 'Solar Hijri calendar')}>
      <div className="calendar-caption">{t('هجری خورشیدی', 'SOLAR HIJRI')}</div>
      <div className="calendar-month"><button type="button" disabled={previous.last < min} onClick={() => navigate(-1)} aria-label={t('ماه قبل', 'Previous month')}>{isFa ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}</button><strong aria-live="polite">{persianMonthName(cursor, lang)} {year}</strong><button type="button" disabled={following.first > max} onClick={() => navigate(1)} aria-label={t('ماه بعد', 'Next month')}>{isFa ? <ChevronLeft size={18}/> : <ChevronRight size={18}/>}</button></div>
      <div className="calendar-weekdays" aria-hidden="true">{weekdays.map((day, index) => <abbr key={day} title={dayNames[index]}>{day}</abbr>)}</div>
      <div ref={grid} className="calendar-days" role="group" aria-label={t('روزهای ماه', 'Days of the month')}>{persianMonthGrid(cursor).map(day => <button key={day.iso} type="button" data-date={day.iso} tabIndex={day.iso === active ? 0 : -1} disabled={!day.inMonth || day.iso < min || day.iso > max} className={`${!day.inMonth ? 'other-month' : ''} ${day.iso === value ? 'selected' : ''} ${day.iso === min ? 'today' : ''}`} aria-label={persianDateLabel(day.iso, lang, true)} aria-pressed={day.iso === value} aria-current={day.iso === min ? 'date' : undefined} onFocus={() => setActive(day.iso)} onKeyDown={event => keyboard(event, day.iso)} onClick={() => choose(day.iso)}>{num(day.day)}</button>)}</div>
      <div className="calendar-bottom"><button type="button" className="calendar-today" onClick={() => choose(min)}>{t('امروز', 'Today')}</button><span>{t('زمان‌ها به وقت تهران', 'Tehran time')}</span></div>
    </div>}
  </div>;
}
