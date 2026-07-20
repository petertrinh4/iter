import { describe, it, expect } from "vitest";

// ── Helpers mirroring the calendar logic in HomePage ────────────────────────

function dateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function buildCalendarCells(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

interface Run {
  _id: string;
  distanceMiles: number;
  createdAt: string;
}

function groupRunsByDay(runs: Run[]): Record<string, Run[]> {
  const map: Record<string, Run[]> = {};
  for (const run of runs) {
    const key = dateKey(new Date(run.createdAt));
    (map[key] ??= []).push(run);
  }
  return map;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("dateKey helper", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(dateKey(new Date(Date.UTC(2026, 6, 16)))).toBe("2026-07-16"); // Note: Month 6 is July
  });
  it("pads single-digit month and day with zeros", () => {
  expect(dateKey(new Date(Date.UTC(2026, 0, 5)))).toBe("2026-01-05"); // 0 is January!
});
});

describe("buildCalendarCells", () => {
  it("starts with correct number of null padding cells", () => {
    // July 2026 starts on a Wednesday (day index 3)
    const cells = buildCalendarCells(2026, 6);
    const leadingNulls = cells.filter((c) => c === null).length;
    expect(leadingNulls).toBe(3);
  });

  it("contains the correct number of days for the month", () => {
    const cells = buildCalendarCells(2026, 6); // July = 31 days
    const days = cells.filter((c) => c !== null);
    expect(days.length).toBe(31);
  });

  it("handles February in a non-leap year", () => {
    const cells = buildCalendarCells(2025, 1); // Feb 2025 = 28 days
    const days = cells.filter((c) => c !== null);
    expect(days.length).toBe(28);
  });

  it("handles February in a leap year", () => {
    const cells = buildCalendarCells(2024, 1); // Feb 2024 = 29 days
    const days = cells.filter((c) => c !== null);
    expect(days.length).toBe(29);
  });
});

describe("groupRunsByDay", () => {
  const mockRuns: Run[] = [
    { _id: "1", distanceMiles: 2.5, createdAt: "2026-07-10T08:00:00Z" },
    { _id: "2", distanceMiles: 1.8, createdAt: "2026-07-10T18:00:00Z" },
    { _id: "3", distanceMiles: 3.2, createdAt: "2026-07-15T07:00:00Z" },
  ];

  it("groups two runs on the same day together", () => {
    const grouped = groupRunsByDay(mockRuns);
    expect(grouped["2026-07-10"]).toHaveLength(2);
  });

  it("keeps runs on different days separate", () => {
    const grouped = groupRunsByDay(mockRuns);
    expect(grouped["2026-07-15"]).toHaveLength(1);
  });

  it("returns empty object for no runs", () => {
    expect(groupRunsByDay([])).toEqual({});
  });

  it("does not create keys for days with no runs", () => {
    const grouped = groupRunsByDay(mockRuns);
    expect(grouped["2026-07-01"]).toBeUndefined();
  });
});
