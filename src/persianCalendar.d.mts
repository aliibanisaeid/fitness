export function isoDate(value: string): Date;
export function shiftDays(value: string, days: number): string;
export function persianParts(value: string): { year: number; month: number; day: number };
export function persianMonth(value: string): { first: string; last: string; next: string; days: number; year: number; month: number };
export function movePersianMonth(value: string, direction: number): string;
export function persianMonthGrid(value: string): { iso: string; day: number; inMonth: boolean }[];
export function persianMonthName(value: string, locale?: string): string;
export function persianDateLabel(value: string, locale?: string, weekday?: boolean): string;
