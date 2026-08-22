import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const artworkInput = {
  collectionId: 1,
  title: "Unauthorized test artwork",
  slug: "unauthorized-test-artwork",
  imageBase64: "data:image/jpeg;base64,AA==",
};

describe("server-enforced Admin Portal access", () => {
  it("rejects an unauthenticated request even when it contains the former admin bypass flag", async () => {
    const ctx = { ...createContext(null), isAdminAuth: true } as TrpcContext & { isAdminAuth: boolean };
    const caller = appRouter.createCaller(ctx);

    await expect(caller.artworks.create(artworkInput)).rejects.toMatchObject<Partial<TRPCError>>({
      code: "FORBIDDEN",
    });
  });

  it("rejects a signed-in non-administrator before any admin operation is performed", async () => {
    const caller = appRouter.createCaller(createContext({
      id: 24,
      openId: "standard-user",
      name: "Standard user",
      email: "user@example.com",
      loginMethod: "email",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    }));

    await expect(caller.artworks.create(artworkInput)).rejects.toMatchObject<Partial<TRPCError>>({
      code: "FORBIDDEN",
    });
  });

  it("rejects unauthenticated callers for every sensitive management data procedure", async () => {
    const caller = appRouter.createCaller(createContext(null));
    const restrictedCalls = [
      () => caller.contact.list(),
      () => caller.comments.listAll(),
      () => caller.paymentSettings.get(),
      () => caller.notifications.sendToAdmin({ title: "System event", body: "Unauthorized notification", type: "system" }),
      () => caller.analytics.summary({ days: 7 }),
      () => caller.dashboard.summary({ days: 30 }),
      () => caller.dashboard.spotlight(),
      () => caller.dashboard.selectSpotlightArtwork({ artworkId: 1 }),
      () => caller.dashboard.uploadSpotlightImage({ imageBase64: "data:image/jpeg;base64,AA==" }),
      () => caller.analyticsSettings.get(),
      () => caller.analyticsSettings.update({ gaMeasurementId: "G-TEST123" }),
      () => caller.newsletterStudio.overview(),
      () => caller.newsletterStudio.createCampaign({ title: "No access", subject: "No access", body: "No access message" }),
      () => caller.newsletterStudio.createReplyDraft({ contactSubmissionId: 1, subject: "No access", body: "No access message" }),
      () => caller.newsletter.list(),
      () => caller.newsletter.delete({ id: 1 }),
      () => caller.notifications.list(),
      () => caller.notifications.markRead({ id: 1 }),
      () => caller.orders.list(),
      () => caller.artworks.bulkPriceUpdate({ ids: [1], priceZar: 8500 }),
      () => caller.pricing.zarUsdRate(),
    ];

    for (const restrictedCall of restrictedCalls) {
      await expect(restrictedCall()).rejects.toMatchObject<Partial<TRPCError>>({ code: "FORBIDDEN" });
    }
  });

  it("rejects signed-in non-administrators for sensitive management data", async () => {
    const caller = appRouter.createCaller(createContext({
      id: 25,
      openId: "non-admin-reader",
      name: "Non-admin reader",
      email: "reader@example.com",
      loginMethod: "email",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    }));
    const restrictedCalls = [
      () => caller.contact.list(),
      () => caller.comments.listAll(),
      () => caller.paymentSettings.get(),
      () => caller.analytics.downloadReport({ days: 7 }),
      () => caller.dashboard.summary({ days: 30 }),
      () => caller.dashboard.spotlight(),
      () => caller.dashboard.selectSpotlightArtwork({ artworkId: 1 }),
      () => caller.dashboard.uploadSpotlightImage({ imageBase64: "data:image/jpeg;base64,AA==" }),
      () => caller.analyticsSettings.get(),
      () => caller.analyticsSettings.update({ gaMeasurementId: "G-TEST123" }),
      () => caller.newsletterStudio.overview(),
      () => caller.newsletterStudio.createCampaign({ title: "No access", subject: "No access", body: "No access message" }),
      () => caller.newsletterStudio.createReplyDraft({ contactSubmissionId: 1, subject: "No access", body: "No access message" }),
      () => caller.newsletter.list(),
      () => caller.newsletter.delete({ id: 1 }),
      () => caller.notifications.list(),
      () => caller.notifications.markAllRead(),
      () => caller.orders.list(),
      () => caller.artworks.bulkPriceUpdate({ ids: [1], priceZar: 8500 }),
      () => caller.pricing.zarUsdRate(),
    ];

    for (const restrictedCall of restrictedCalls) {
      await expect(restrictedCall()).rejects.toMatchObject<Partial<TRPCError>>({ code: "FORBIDDEN" });
    }
  });

  it("keeps public artwork browsing available without an administrator session", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.artworks.list()).resolves.toBeDefined();
  });

  it.each([
    { id: 0, openId: "gallery-native-admin", name: "Gallery Administrator", email: null, loginMethod: "native_admin" },
    { id: 1, openId: "existing-approved-admin", name: "Existing approved Administrator", email: "approved-admin@example.com", loginMethod: "email" },
  ])("returns the same Administrator-only studio rate to approved access profile %#", async (administrator) => {
    const caller = appRouter.createCaller(createContext({
      ...administrator,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    }));

    await expect(caller.pricing.zarUsdRate()).resolves.toMatchObject({
      rate: 0.062,
      source: "fixed",
      fetchedAt: "2026-08-21T00:00:00.000Z",
    });
  });
});
