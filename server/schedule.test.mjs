import { describe, expect, it } from 'vitest';
import scheduleModule from './schedule.js';

const { getNextOccurrence, legacySchedule, parseSchedule, vietnamLocalToDate } = scheduleModule;

describe('AI schedule calculator', () => {
  it('converts the legacy UTC hour to an equivalent daily Vietnam schedule', () => {
    expect(legacySchedule(1)).toMatchObject({ type: 'weekly', time: '08:00', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] });
    expect(parseSchedule('{broken', 17).time).toBe('00:00');
  });

  it('finds the next selected weekday in Vietnam time', () => {
    const schedule = { type: 'weekly', daysOfWeek: [1, 3], time: '08:30' };
    expect(getNextOccurrence(schedule, new Date('2026-08-09T23:00:00Z'))?.toISOString()).toBe('2026-08-10T01:30:00.000Z');
    expect(getNextOccurrence(schedule, new Date('2026-08-10T02:00:00Z'))?.toISOString()).toBe('2026-08-12T01:30:00.000Z');
  });

  it('keeps interval cadence from its persisted anchor and skips missed slots', () => {
    const next = getNextOccurrence({ type: 'interval', intervalHours: 6 }, new Date('2026-08-08T13:00:00Z'), new Date('2026-08-08T00:00:00Z'));
    expect(next?.toISOString()).toBe('2026-08-08T18:00:00.000Z');
  });

  it('uses future one-time Vietnam timestamps and rejects impossible dates', () => {
    expect(vietnamLocalToDate('2026-02-30T08:00')).toBeNull();
    const next = getNextOccurrence({ type: 'once', runAt: ['2026-08-08T08:00', '2026-08-09T09:15'] }, new Date('2026-08-08T02:00:00Z'));
    expect(next?.toISOString()).toBe('2026-08-09T02:15:00.000Z');
  });
});
