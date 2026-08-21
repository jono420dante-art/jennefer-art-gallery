import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  updateArtwork: vi.fn(),
  recordNotificationEvent: vi.fn(),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://storage.example/artworks/replacement.jpg" }),
}));

import * as db from "./db";
import { appRouter } from "./routers";
import { storagePut } from "./storage";

const adminContext = {
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
  req: { protocol: "https", headers: {} },
  res: {},
} as unknown as TrpcContext;

describe("artwork update persistence", () => {
  beforeEach(() => vi.clearAllMocks());

  it("writes edited prices to the persisted priceZar and priceUsd database columns", async () => {
    const caller = appRouter.createCaller(adminContext);

    await caller.artworks.update({
      id: 44,
      priceZar: "8500.00",
      priceUsd: 500,
    });

    expect(db.updateArtwork).toHaveBeenCalledWith(44, {
      priceZar: "8500",
      priceUsd: "500",
    });
  });

  it("updates an artwork image only when the administrator selects a replacement", async () => {
    const caller = appRouter.createCaller(adminContext);

    await caller.artworks.update({
      id: 45,
      title: "Restored Wildlife Study",
      imageBase64: "data:image/png;base64,cHJldmlldy1ieXRlcw==",
    });

    expect(storagePut).toHaveBeenCalledWith(
      expect.stringMatching(/^artworks\/.*\.png$/),
      expect.any(Buffer),
      "image/png",
    );
    expect(db.updateArtwork).toHaveBeenCalledWith(45, expect.objectContaining({
      title: "Restored Wildlife Study",
      imageUrl: "https://storage.example/artworks/replacement.jpg",
      imageKey: expect.stringMatching(/^artworks\/.*\.png$/),
    }));
  });
});
