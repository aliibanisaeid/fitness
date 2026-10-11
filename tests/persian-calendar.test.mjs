import test from 'node:test';
import assert from 'node:assert/strict';
import { isoDate, movePersianMonth, persianDateLabel, persianMonth, persianMonthGrid, persianParts, shiftDays } from '../src/persianCalendar.mjs';

test('Solar Hijri dates preserve Nowruz and the leap Esfand day', () => {
  assert.deepEqual(persianParts('2024-03-20'), { year: 1403, month: 1, day: 1 });
  assert.deepEqual(persianParts('2025-03-20'), { year: 1403, month: 12, day: 30 });
  assert.deepEqual(persianParts('2025-03-21'), { year: 1404, month: 1, day: 1 });
  assert.deepEqual(persianParts('2026-10-11'), { year: 1405, month: 7, day: 19 });
  assert.match(persianDateLabel('2026-10-11'), /۱۹ مهر ۱۴۰۵/);
});

test('Persian month movement clamps long months and crosses year boundaries', () => {
  assert.equal(movePersianMonth('2026-09-22', 1), '2026-10-22');
  assert.deepEqual(persianParts(movePersianMonth('2025-03-20', 1)), { year: 1404, month: 1, day: 30 });
  assert.equal(persianMonth('2025-03-20').days, 30);
  assert.equal(persianMonth('2026-03-20').days, 29);
});

test('The six-week month grid starts on Saturday and contains each month day once', () => {
  for (const date of ['2024-03-20', '2025-03-20', '2026-10-11', '2027-01-09']) {
    const month = persianMonth(date);
    const grid = persianMonthGrid(date);
    assert.equal(grid.length, 42);
    assert.equal(isoDate(grid[0].iso).getUTCDay(), 6);
    assert.equal(new Set(grid.map(day => day.iso)).size, 42);
    assert.equal(grid.filter(day => day.inMonth).length, month.days);
    assert.equal(grid.filter(day => day.inMonth)[0].iso, month.first);
    assert.equal(grid.filter(day => day.inMonth).at(-1).iso, month.last);
  }
});

test('Date arithmetic ignores local clock changes and rejects impossible dates', () => {
  assert.equal(shiftDays('2026-12-31', 1), '2027-01-01');
  assert.equal(shiftDays('2025-03-01', -1), '2025-02-28');
  for (const date of ['2026-02-30', '1405/07/19', '', '2026-13-01']) assert.throws(() => isoDate(date), RangeError);
});
