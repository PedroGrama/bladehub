/** Pure helpers for public booking slot generation (aligned with createPublicAppointment rules). */

export const SLOT_STEP_MINUTES = 15;

export function timeStrToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTimeStr(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function weekdayFromDateStr(dateStr: string): number {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(y, mo - 1, d).getDay();
}

export function makeLocalDateTime(dateStr: string, timeStr: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, m] = timeStr.split(":").map(Number);
  return new Date(y, mo - 1, d, h, m, 0, 0);
}

export type TimeSegment = readonly [number, number];

type Segment = TimeSegment;

export function subtractBreak(
  openStart: number,
  openEnd: number,
  breakStart: number | null,
  breakEnd: number | null
): Segment[] {
  if (breakStart === null || breakEnd === null) {
    if (openStart < openEnd) return [[openStart, openEnd]];
    return [];
  }
  if (breakEnd <= openStart || breakStart >= openEnd) {
    if (openStart < openEnd) return [[openStart, openEnd]];
    return [];
  }
  const out: Segment[] = [];
  if (openStart < breakStart) {
    out.push([openStart, Math.min(breakStart, openEnd)]);
  }
  if (breakEnd < openEnd) {
    out.push([Math.max(breakEnd, openStart), openEnd]);
  }
  return out.filter(([a, b]) => a < b);
}

export function intersectSegments(a: Segment, b: Segment): Segment | null {
  const s = Math.max(a[0], b[0]);
  const e = Math.min(a[1], b[1]);
  if (s >= e) return null;
  return [s, e];
}

/** Overlap between [aStart, aEnd) and [bStart, bEnd) */
export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function collectSlotsInSegments(
  segments: Segment[],
  durationMinutes: number,
  slotStep: number,
  filterStartMin?: number // e.g. "now" for today — inclusive lower bound
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const [segStart, segEnd] of segments) {
    for (let t = segStart; t + durationMinutes <= segEnd; t += slotStep) {
      if (filterStartMin !== undefined && t < filterStartMin) continue;
      const key = minutesToTimeStr(t);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(key);
      }
    }
  }
  return out.sort((a, b) => timeStrToMinutes(a) - timeStrToMinutes(b));
}
