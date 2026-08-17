import { describe, expect, it } from "vitest";
import { buildDailyTrafficSeries } from "./db";

describe("daily first-party analytics series", () => {
  it("buckets stored timestamps into a complete calendar series without SQL DATE grouping", () => {
    const series = buildDailyTrafficSeries({
      days: 3,
      now: new Date("2026-08-17T12:00:00.000Z"),
      sessionTimestamps: ["2026-08-15 09:00:00", "2026-08-17 11:00:00"],
      pageViewTimestamps: ["2026-08-15 09:01:00", "2026-08-15 10:01:00", "2026-08-17 11:01:00"],
      conversionTimestamps: ["2026-08-17 11:02:00"],
    });

    expect(series).toEqual([
      { date: "2026-08-15", sessions: 1, pageViews: 2, conversionClicks: 0 },
      { date: "2026-08-16", sessions: 0, pageViews: 0, conversionClicks: 0 },
      { date: "2026-08-17", sessions: 1, pageViews: 1, conversionClicks: 1 },
    ]);
  });

  it("ignores records outside the requested calendar window", () => {
    const series = buildDailyTrafficSeries({
      days: 2,
      now: new Date("2026-08-17T12:00:00.000Z"),
      sessionTimestamps: ["2026-08-14 09:00:00", "2026-08-16 09:00:00"],
      pageViewTimestamps: [],
      conversionTimestamps: [],
    });

    expect(series).toEqual([
      { date: "2026-08-16", sessions: 1, pageViews: 0, conversionClicks: 0 },
      { date: "2026-08-17", sessions: 0, pageViews: 0, conversionClicks: 0 },
    ]);
  });
});
