import { describe, expect, it } from "vitest";
import { buildMonthlyCountSeries } from "./db";

describe("executive dashboard monthly collector growth", () => {
  it("builds a zero-filled six-month newsletter series from real signup timestamps", () => {
    expect(buildMonthlyCountSeries([
      "2026-04-12 08:00:00",
      "2026-06-05 11:00:00",
      "2026-06-25 16:00:00",
      "2026-08-01 09:00:00",
    ], 6, new Date("2026-08-17T12:00:00.000Z"))).toEqual([
      { key: "2026-03", label: "Mar", count: 0 },
      { key: "2026-04", label: "Apr", count: 1 },
      { key: "2026-05", label: "May", count: 0 },
      { key: "2026-06", label: "Jun", count: 2 },
      { key: "2026-07", label: "Jul", count: 0 },
      { key: "2026-08", label: "Aug", count: 1 },
    ]);
  });

  it("does not count timestamps outside the displayed months", () => {
    expect(buildMonthlyCountSeries(["2026-01-01 00:00:00"], 2, new Date("2026-08-17T12:00:00.000Z"))).toEqual([
      { key: "2026-07", label: "Jul", count: 0 },
      { key: "2026-08", label: "Aug", count: 0 },
    ]);
  });
});
