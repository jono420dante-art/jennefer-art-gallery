import { describe, expect, it } from "vitest";
import { buildEngagementMetrics } from "./db";

describe("first-party engagement metrics", () => {
  it("derives engagement time, engagement rate, event density, device mix, and content signals from stored records", () => {
    const metrics = buildEngagementMetrics({
      sessions: [
        { sessionId: "session-a", firstSeenAt: "2026-08-17 10:00:00", lastSeenAt: "2026-08-17 10:02:00", deviceType: "desktop" },
        { sessionId: "session-b", firstSeenAt: "2026-08-17 10:00:00", lastSeenAt: "2026-08-17 10:00:10", deviceType: "mobile" },
      ],
      events: [
        { sessionId: "session-a", eventType: "page_view", pagePath: "/", target: null, artworkId: null, createdAt: "2026-08-17 10:00:00" },
        { sessionId: "session-a", eventType: "heartbeat", pagePath: "/", target: null, artworkId: null, createdAt: "2026-08-17 10:01:00" },
        { sessionId: "session-a", eventType: "heartbeat", pagePath: "/", target: null, artworkId: null, createdAt: "2026-08-17 10:02:00" },
        { sessionId: "session-a", eventType: "click_artwork", pagePath: "/", target: "/artwork/riana", artworkId: 3, createdAt: "2026-08-17 10:00:05" },
        { sessionId: "session-a", eventType: "scroll_depth", pagePath: "/artwork/riana", target: "75_percent_page_depth", artworkId: 3, createdAt: "2026-08-17 10:01:00" },
        { sessionId: "session-b", eventType: "page_view", pagePath: "/gallery", target: null, artworkId: null, createdAt: "2026-08-17 10:00:00" },
      ],
    });

    expect(metrics).toMatchObject({
      totalEngagementSeconds: 120,
      averageEngagementSeconds: 60,
      engagedSessions: 1,
      engagementRate: 50,
      eventsPerSession: 3,
      deviceMix: [
        { device: "desktop", sessions: 1, percentage: 50 },
        { device: "mobile", sessions: 1, percentage: 50 },
      ],
      engagementSignals: [
        { eventType: "click_artwork", events: 1 },
        { eventType: "scroll_depth", events: 1 },
      ],
    });
  });

  it("returns safe zero metrics when no first-party sessions have been recorded", () => {
    expect(buildEngagementMetrics({ sessions: [], events: [] })).toMatchObject({
      totalEngagementSeconds: 0,
      averageEngagementSeconds: 0,
      engagedSessions: 0,
      engagementRate: 0,
      eventsPerSession: 0,
      deviceMix: [],
      engagementSignals: [],
    });
  });
});
