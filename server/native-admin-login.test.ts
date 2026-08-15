import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { NATIVE_ADMIN_COOKIE, getNativeAdminUser } from "./_core/nativeAdminAuth";
import type { TrpcContext } from "./_core/context";

function createLoggedOutContext() {
  const cookie = vi.fn();
  return {
    ctx: {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { cookie, clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    } satisfies TrpcContext,
    cookie,
  };
}

describe("gallery-native Administrator sign-in", () => {
  it("rejects an incorrect username or password", async () => {
    const { ctx } = createLoggedOutContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.auth.nativeAdminLogin({ username: "grant444", password: "incorrect" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("validates the configured secret credentials through the login endpoint and creates an administrator session", async () => {
    const { ctx, cookie } = createLoggedOutContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.nativeAdminLogin({
      username: process.env.ADMIN_PORTAL_USERNAME ?? "",
      password: process.env.ADMIN_PORTAL_PASSWORD ?? "",
    });

    expect(result.user.role).toBe("admin");
    expect(cookie).toHaveBeenCalledWith(NATIVE_ADMIN_COOKIE, expect.any(String), expect.objectContaining({ httpOnly: true, maxAge: 8 * 60 * 60 * 1000 }));
    const sessionToken = cookie.mock.calls[0][1] as string;
    const sessionUser = await getNativeAdminUser({ headers: { cookie: `${NATIVE_ADMIN_COOKIE}=${sessionToken}` } } as TrpcContext["req"]);
    expect(sessionUser).toMatchObject({ role: "admin", loginMethod: "native_admin" });
  });
});
