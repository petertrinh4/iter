import { describe, it, expect } from "vitest";

// ── Types matching the app ───────────────────────────────────────────────────

interface Run {
  _id: string;
  distanceMiles: number;
  durationSeconds: number;
  createdAt: string;
}

export interface SavedRoute {
  _id: string;
  routeName: string;
  distanceMiles: number;
  waypoints: [number, number][];
}

// ── Stat helpers that mirror the profile panel calculations ──────────────────

const totalMiles = (runs: Run[]): number =>
  runs.reduce((sum, r) => sum + r.distanceMiles, 0);

const totalRuns = (runs: Run[]): number => runs.length;

const longestRun = (runs: Run[]): number | null =>
  runs.length > 0 ? Math.max(...runs.map((r) => r.distanceMiles)) : null;

// ── Route save validation (mirrors saveRoute guard in HomePage) ──────────────

const canSaveRoute = (routeName: string, pointCount: number): boolean =>
  routeName.trim() !== "" && pointCount >= 2;

// ── Waypoint coordinate flip (mirrors saved routes panel click handler) ──────

const flipWaypoints = (waypoints: [number, number][]): [number, number][] =>
  waypoints.map(([lng, lat]) => [lat, lng]);

// ── Tests ────────────────────────────────────────────────────────────────────

describe("All-time stats calculations", () => {
  const mockRuns: Run[] = [
    { _id: "1", distanceMiles: 2.5, durationSeconds: 1800, createdAt: "2026-07-01T10:00:00Z" },
    { _id: "2", distanceMiles: 1.8, durationSeconds: 1200, createdAt: "2026-07-05T08:00:00Z" },
    { _id: "3", distanceMiles: 3.2, durationSeconds: 2400, createdAt: "2026-07-10T07:00:00Z" },
  ];

  it("calculates total miles correctly", () => {
    expect(totalMiles(mockRuns)).toBeCloseTo(7.5);
  });

  it("returns 0 total miles when no runs", () => {
    expect(totalMiles([])).toBe(0);
  });

  it("counts total runs correctly", () => {
    expect(totalRuns(mockRuns)).toBe(3);
  });

  it("returns 0 total runs when empty", () => {
    expect(totalRuns([])).toBe(0);
  });

  it("finds the longest run correctly", () => {
    expect(longestRun(mockRuns)).toBe(3.2);
  });

  it("returns null for longest run when no runs", () => {
    expect(longestRun([])).toBeNull();
  });

  it("handles a single run correctly", () => {
    const single = [mockRuns[0]];
    expect(totalMiles(single)).toBe(2.5);
    expect(totalRuns(single)).toBe(1);
    expect(longestRun(single)).toBe(2.5);
  });
});

describe("Route save validation", () => {
  it("allows saving with a name and 2+ points", () => {
    expect(canSaveRoute("Morning Run", 2)).toBe(true);
    expect(canSaveRoute("Morning Run", 5)).toBe(true);
  });

  it("blocks saving with empty name", () => {
    expect(canSaveRoute("", 3)).toBe(false);
    expect(canSaveRoute("   ", 3)).toBe(false);
  });

  it("blocks saving with fewer than 2 points", () => {
    expect(canSaveRoute("Morning Run", 0)).toBe(false);
    expect(canSaveRoute("Morning Run", 1)).toBe(false);
  });

  it("blocks saving with both missing", () => {
    expect(canSaveRoute("", 0)).toBe(false);
  });
});

describe("Waypoint coordinate flipping", () => {
  it("flips [lng, lat] to [lat, lng] for Leaflet", () => {
    const waypoints: [number, number][] = [
      [-81.3792, 28.5383],
      [-81.3800, 28.5390],
    ];
    const flipped = flipWaypoints(waypoints);
    expect(flipped[0]).toEqual([28.5383, -81.3792]);
    expect(flipped[1]).toEqual([28.5390, -81.3800]);
  });

  it("returns empty array for empty waypoints", () => {
    expect(flipWaypoints([])).toEqual([]);
  });

  it("handles a single waypoint", () => {
    expect(flipWaypoints([[-81.379, 28.538]])).toEqual([[28.538, -81.379]]);
  });
});
