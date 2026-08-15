import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = {
  user: null,
  req: { protocol: "https", headers: {} },
  res: {},
} as unknown as TrpcContext;

describe("newsletter consent", () => {
  it("rejects a public newsletter signup without explicit consent before reading or writing subscriber data", async () => {
    const caller = appRouter.createCaller(context);
    await expect(caller.newsletter.signup({
      firstName: "",
      lastName: "",
      email: "collector@example.com",
      consent: false,
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
