import { describe, expect, it } from "vitest";
import { canonicalUrlForPath, PUBLIC_SITE_ORIGIN } from "./canonicalUrl";

describe("canonicalUrlForPath", () => {
  it("uses the configured public domain for the home route", () => {
    expect(canonicalUrlForPath("/")).toBe(`${PUBLIC_SITE_ORIGIN}/`);
  });

  it("removes preview query strings and fragments from public artwork canonicals", () => {
    expect(canonicalUrlForPath("/artwork/riana?from_webdev=1#details")).toBe(`${PUBLIC_SITE_ORIGIN}/artwork/riana`);
  });
});
