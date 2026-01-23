import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  isAdminAuth?: boolean;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let isAdminAuth = false;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Check for admin token in headers
  const adminToken = opts.req.headers['x-admin-token'];
  if (adminToken === 'admin-token-jennefer-2024') {
    isAdminAuth = true;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    isAdminAuth,
  };
}
