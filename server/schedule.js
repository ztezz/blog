const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;
const DEFAULT_SCHEDULE = Object.freeze({ type: 'weekly', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], time: '08:00' });

const legacySchedule = runHourUtc => {
  const vietnamHour = (Number(runHourUtc ?? 1) + 7) % 24;
  return { ...DEFAULT_SCHEDULE, time: `${String(vietnamHour).padStart(2, '0')}:00` };
};

const parseSchedule = (value, runHourUtc = 1) => {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (parsed && typeof parsed === 'object' && ['weekly', 'interval', 'once'].includes(parsed.type)) return parsed;
  } catch {
    // Legacy rows are converted from their UTC hour below.
  }
  return legacySchedule(runHourUtc);
};

const vietnamLocalToDate = value => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hour - 7, minute));
  const local = new Date(date.getTime() + VIETNAM_OFFSET_MS);
  if (local.getUTCFullYear() !== year || local.getUTCMonth() !== month - 1 || local.getUTCDate() !== day || local.getUTCHours() !== hour || local.getUTCMinutes() !== minute) return null;
  return date;
};

const getNextOccurrence = (schedule, now = new Date(), anchorAt = now) => {
  if (schedule.type === 'interval') {
    const intervalMs = schedule.intervalHours * 60 * 60 * 1000;
    const anchor = new Date(anchorAt);
    if (!Number.isFinite(intervalMs) || intervalMs <= 0 || Number.isNaN(anchor.getTime())) return null;
    const elapsed = Math.max(0, now.getTime() - anchor.getTime());
    return new Date(anchor.getTime() + (Math.floor(elapsed / intervalMs) + 1) * intervalMs);
  }
  if (schedule.type === 'once') {
    return schedule.runAt
      .map(vietnamLocalToDate)
      .filter(date => date && date > now)
      .sort((first, second) => first.getTime() - second.getTime())[0] || null;
  }
  const [hour, minute] = schedule.time.split(':').map(Number);
  const localNow = new Date(now.getTime() + VIETNAM_OFFSET_MS);
  for (let offset = 0; offset <= 7; offset += 1) {
    const localCandidate = new Date(Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate() + offset, hour, minute));
    if (!schedule.daysOfWeek.includes(localCandidate.getUTCDay())) continue;
    const candidate = new Date(localCandidate.getTime() - VIETNAM_OFFSET_MS);
    if (candidate > now) return candidate;
  }
  return null;
};

module.exports = { DEFAULT_SCHEDULE, getNextOccurrence, legacySchedule, parseSchedule, vietnamLocalToDate };
