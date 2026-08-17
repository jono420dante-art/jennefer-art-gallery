import { describe, expect, it } from "vitest";
import { getTrpcEndpoint } from "./trpcEndpoint";

describe("getTrpcEndpoint", () => {
  it("always resolves tRPC to the origin root rather than the current application route", () => {
    expect(getTrpcEndpoint("https://gallery.example/admin-login")).toBe("https://gallery.example/api/trpc");
    expect(getTrpcEndpoint("https://preview.example/admin-dashboard?from_webdev=1")).toBe("https://preview.example/api/trpc");
  });
});
