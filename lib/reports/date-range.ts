import type { DateRange, DateRangePreset } from "@/lib/reports/types";

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function startOfMonth(date: Date) {
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function buildDateRange(
  preset: DateRangePreset,
  now = new Date(),
  customStart?: string,
  customEnd?: string
): DateRange {
  if (preset === "custom" && customStart && customEnd) {
    const start = startOfDay(new Date(customStart));
    const end = endOfDay(new Date(customEnd));

    return {
      preset,
      start: Number.isNaN(start.getTime()) ? startOfDay(now) : start,
      end: Number.isNaN(end.getTime()) ? endOfDay(now) : end,
      label: `${customStart} – ${customEnd}`,
    };
  }

  if (preset === "today") {
    return {
      preset,
      start: startOfDay(now),
      end: endOfDay(now),
      label: now.toISOString().slice(0, 10),
    };
  }

  if (preset === "week") {
    return {
      preset,
      start: startOfWeek(now),
      end: endOfDay(now),
      label: "week",
    };
  }

  return {
    preset: preset === "month" ? "month" : preset,
    start: startOfMonth(now),
    end: endOfDay(now),
    label: "month",
  };
}

export function isWithinRange(date: Date | null, range: DateRange) {
  if (!date) {
    return false;
  }

  return date.getTime() >= range.start.getTime() && date.getTime() <= range.end.getTime();
}

export function parseFlexibleDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const iso = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (iso) {
    const parsed = new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3])
    );

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getPreviousRange(range: DateRange): DateRange {
  const duration = range.end.getTime() - range.start.getTime();
  const previousEnd = new Date(range.start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);

  return {
    preset: range.preset,
    start: previousStart,
    end: previousEnd,
    label: "previous",
  };
}
