import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  createContactSubmission: vi.fn(),
}));

import { appRouter } from "./routers";
import * as db from "./db";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    isAdminAuth: false,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("commission lead capture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores a complete commission request in the existing contact lead system", async () => {
    vi.mocked(db.createContactSubmission).mockResolvedValue({} as never);
    const caller = appRouter.createCaller(createPublicContext());

    const input = {
      name: "Naledi Mokoena",
      email: "naledi@example.com",
      phone: "+27 84 640 5120",
      subject: "commission" as const,
      message: "I would like a warm wildlife painting for my living room.",
      commissionType: "Wildlife",
      commissionSize: "90 × 120 cm",
      commissionBudget: "R 15,000 - R 25,000",
      commissionTimeline: "3-6 months",
    };

    await expect(caller.contact.submit(input)).resolves.toEqual({ success: true });
    expect(db.createContactSubmission).toHaveBeenCalledWith(input);
  });

  it("accepts a commission request without optional telephone and size fields", async () => {
    vi.mocked(db.createContactSubmission).mockResolvedValue({} as never);
    const caller = appRouter.createCaller(createPublicContext());

    const input = {
      name: "Amara Smith",
      email: "amara@example.com",
      subject: "commission" as const,
      message: "I am exploring a family portrait commission.",
      commissionType: "Portrait",
      commissionBudget: "R 8,000 - R 12,000",
      commissionTimeline: "Flexible",
    };

    await expect(caller.contact.submit(input)).resolves.toEqual({ success: true });
    expect(db.createContactSubmission).toHaveBeenCalledWith(input);
  });

  it("rejects a commission lead without a valid email address", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.contact.submit({
      name: "Amara Smith",
      email: "not-an-email",
      subject: "commission",
      message: "I would like a custom painting.",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(db.createContactSubmission).not.toHaveBeenCalled();
  });

  it("rejects a commission lead without the required message", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.contact.submit({
      name: "Amara Smith",
      email: "amara@example.com",
      subject: "commission",
      message: "",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(db.createContactSubmission).not.toHaveBeenCalled();
  });
});
