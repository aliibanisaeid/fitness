const partsFormatter = new Intl.DateTimeFormat('en-US', {
  calendar: 'persian', numberingSystem: 'latn', timeZone: 'UTC',
  year: 'numeric', month: 'numeric', day: 'numeric',
});

export function isoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError('Invalid date');
  const date = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new RangeError('Invalid date');
  return date;
}

export function shiftDays(value, days) {
  const date = isoDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function persianParts(value) {
  const parts = partsFormatter.formatToParts(isoDate(value));
  const read = type => Number(parts.find(part => part.type === type).value);
  return { year: read('year'), month: read('month'), day: read('day') };
}

export function persianMonth(value) {
  const parts = persianParts(value);
  const first = shiftDays(value, 1 - parts.day);
  const probe = shiftDays(first, 32);
  const next = shiftDays(probe, 1 - persianParts(probe).day);
  const last = shiftDays(next, -1);
  return { first, last, next, days: persianParts(last).day, year: parts.year, month: parts.month };
}

export function movePersianMonth(value, direction) {
  const parts = persianParts(value);
  const current = persianMonth(value);
  const target = persianMonth(direction > 0 ? current.next : shiftDays(current.first, -1));
  return shiftDays(target.first, Math.min(parts.day, target.days) - 1);
}

export function persianMonthGrid(value) {
  const month = persianMonth(value);
  const offset = (isoDate(month.first).getUTCDay() + 1) % 7;
  const start = shiftDays(month.first, -offset);
  return Array.from({ length: 42 }, (_, index) => {
    const iso = shiftDays(start, index);
    return { iso, day: persianParts(iso).day, inMonth: iso >= month.first && iso <= month.last };
  });
}

export function persianMonthName(value, locale = 'fa') {
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    calendar: 'persian', month: 'long', timeZone: 'UTC',
  }).format(isoDate(value));
}

export function persianDateLabel(value, locale = 'fa', weekday = false) {
  const parts = persianParts(value);
  const digits = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { useGrouping: false });
  const label = `${digits.format(parts.day)} ${persianMonthName(value, locale)} ${digits.format(parts.year)}`;
  if (!weekday) return label;
  const day = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { weekday: 'long', timeZone: 'UTC' }).format(isoDate(value));
  return `${day}، ${label}`;
}
