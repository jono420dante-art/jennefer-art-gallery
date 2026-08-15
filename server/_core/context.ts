import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { sdk } from "./sdk";
import { getNativeAdminUser } from "./nativeAdminAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: any | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: any | null = null;

  try {
    user = await getNativeAdminUser(opts.req);
    if (!user) user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
