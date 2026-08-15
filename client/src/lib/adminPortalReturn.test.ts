import { describe, expect, it } from "vitest";
import { toSafeAdminPortalPath } from "./adminPortalReturn";

describe("Admin Portal OAuth return path validation", () => {
  it("allows only the two internal administrator destinations", () => {
    expect(toSafeAdminPortalPath("/admin-dashboard?panel=seo")).toBe("/admin-dashboard?panel=seo");
    expect(toSafeAdminPortalPath("/admin")).toBe("/admin");
  });

  it("rejects external or non-admin destinations", () => {
    expect(toSafeAdminPortalPath("https://untrusted.example/admin")).toBeNull();
    expect(toSafeAdminPortalPath("/gallery")).toBeNull();
    expect(toSafeAdminPortalPath("//untrusted.example")).toBeNull();
  });
});
