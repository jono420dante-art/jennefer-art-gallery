import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  createContactSubmission: vi.fn(),
  createComment: vi.fn(),
  createNewsletterSignup: vi.fn(),
  getNewsletterSignupByEmail: vi.fn(),
  updateArtwork: vi.fn(),
  recordNotificationEvent: vi.fn(),
}));

import * as db from "./db";
import { appRouter } from "./routers";

const publicContext = { user: null, req: { protocol: "https", headers: {} }, res: {} } as unknown as TrpcContext;
const adminContext = {
  ...publicContext,
  user: {
    id: 1,
    openId: "native-admin",
    name: "Gallery Administrator",
    email: null,
    loginMethod: "native_admin",
    role: "admin" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
};

describe("first-party notification event triggers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("records collector and enquiry events after valid public submissions", async () => {
    vi.mocked(db.getNewsletterSignupByEmail).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(publicContext);

    await caller.contact.submit({ name: "Visitor", email: "visitor@example.com", subject: "commission", message: "I would like a portrait." });
    await caller.newsletter.signup({ firstName: "Visitor", lastName: "", email: "collector@example.com", consent: true });

    expect(db.recordNotificationEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "message", title: "Collector enquiry received" }));
    expect(db.recordNotificationEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "collector", title: "Collector joined the mailing list" }));
  });

  it("records moderation and sold-artwork events without exposing the event tools publicly", async () => {
    const caller = appRouter.createCaller(adminContext as TrpcContext);
    await caller.artworks.update({ id: 12, isAvailable: 0 });

    expect(db.recordNotificationEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "sale", metadata: { artworkId: 12 } }));
  });
});
