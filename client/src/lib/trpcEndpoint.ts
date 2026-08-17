/**
 * Builds an origin-rooted tRPC endpoint. Keeping the endpoint rooted at the
 * current origin prevents a nested page such as `/admin-login` from ever
 * resolving API traffic to an application-route HTML fallback.
 */
export function getTrpcEndpoint(origin: string) {
  return new URL("/api/trpc", origin).toString();
}
