import { describe, expect, it } from "vitest";
import { zarToUsdInput, zarUsdRateLabel } from "./zarUsdConversion";

describe("ZAR to USD administrator price conversion", () => {
  it("calculates a two-decimal USD price from a valid ZAR amount and live rate", () => {
    expect(zarToUsdInput("8500", 0.05432)).toBe("461.72");
  });

  it("does not generate a price when the amount or rate is invalid", () => {
    expect(zarToUsdInput("", 0.05432)).toBe("");
    expect(zarToUsdInput("-1", 0.05432)).toBe("");
    expect(zarToUsdInput("8500", undefined)).toBe("");
  });

  it("formats the live-rate transparency label", () => {
    expect(zarUsdRateLabel(0.05432)).toBe("R1.00 = $0.0543");
  });
});
