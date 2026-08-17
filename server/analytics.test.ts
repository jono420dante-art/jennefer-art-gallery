import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  recordAnalyticsEvent: vi.fn(),
  getAnalyticsSummary: vi.fn(),
  deleteAnalyticsOlderThan: vi.fn(),
}));

import { appRouter } from "./routers";
import * as db from "./db";
import { createAnalyticsPdf } from "./analyticsReport";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    isAdminAuth: false,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 0,
      openId: "gallery-native-admin",
      name: "Gallery Administrator",
      email: null,
      loginMethod: "native_admin",
      role: "admin",
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("first-party analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records a validated anonymous page-view event", async () => {
    vi.mocked(db.recordAnalyticsEvent).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createPublicContext());
    const input = {
      sessionId: "c7a92359e0224c4e9367af4c2a0f6d16",
      landingPath: "/",
      source: "direct",
      deviceType: "desktop" as const,
      eventType: "page_view" as const,
      pagePath: "/",
    };

    await expect(caller.analytics.track(input)).resolves.toEqual({ success: true });
    expect(db.recordAnalyticsEvent).toHaveBeenCalledWith(input);
  });

  it("rejects unsupported event names before storing data", async () => {
    vi.mocked(db.recordAnalyticsEvent).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.analytics.track({
      sessionId: "c7a92359e0224c4e9367af4c2a0f6d16",
      landingPath: "/",
      source: "direct",
      eventType: "arbitrary_event" as never,
      pagePath: "/",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(db.recordAnalyticsEvent).not.toHaveBeenCalled();
  });

  it("returns the recorded daily traffic series only to an Administrator", async () => {
    const recordedSummary = {
      uniqueSessions: 12,
      pageViews: 31,
      conversionClicks: 6,
      activeVisitors: 2,
      trafficSources: [{ source: "instagram", sessions: 8 }],
      referrers: [{ referrerDomain: "instagram.com", sessions: 8 }],
      topPages: [{ pagePath: "/artwork/riana-1769842761058", views: 9 }],
      topClicks: [{ eventType: "click_whatsapp", target: "Riana", clicks: 4 }],
      dailyTraffic: [
        { date: "2026-08-12", sessions: 4, pageViews: 10, conversionClicks: 2 },
        { date: "2026-08-13", sessions: 8, pageViews: 21, conversionClicks: 4 },
      ],
      generatedAt: "2026-08-13T12:00:00.000Z",
    };
    vi.mocked(db.getAnalyticsSummary).mockResolvedValue(recordedSummary);
    const caller = appRouter.createCaller(createAdminContext());

    await expect(caller.analytics.summary({ days: 7 })).resolves.toEqual(recordedSummary);
    expect(db.getAnalyticsSummary).toHaveBeenCalledWith(7);
  });

  it("creates a valid PDF from recorded analytics data", async () => {
    const pdf = await createAnalyticsPdf({
      uniqueSessions: 12,
      pageViews: 31,
      conversionClicks: 6,
      activeVisitors: 2,
      trafficSources: [{ source: "instagram", sessions: 8 }],
      referrers: [{ referrerDomain: "instagram.com", sessions: 8 }],
      topPages: [{ pagePath: "/artwork/riana-1769842761058", views: 9 }],
      topClicks: [{ eventType: "click_whatsapp", target: "Riana", clicks: 4 }],
      generatedAt: "2026-08-13T12:00:00.000Z",
    }, 7);

    expect(pdf.subarray(0, 4).toString("utf8")).toBe("%PDF");
    expect(pdf.byteLength).toBeGreaterThan(500);
  });

  it("allows an Administrator to apply the configured analytics retention rule", async () => {
    vi.mocked(db.deleteAnalyticsOlderThan).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createAdminContext());

    await expect(caller.analytics.clearExpired({ retentionDays: 90 })).resolves.toEqual({ success: true });
    expect(db.deleteAnalyticsOlderThan).toHaveBeenCalledWith(90);
  });
});
