import { describe, expect, it } from "vitest";
import { noticeNextStep, noticeResolutionMeaning, noticeTypeLabel } from "./operationalNotices";

describe("operational notice guidance", () => {
  it("uses concise plain-language labels and resolution guidance", () => {
    expect(noticeTypeLabel("system")).toBe("System check");
    expect(noticeNextStep("message")).toContain("Collector Inbox");
    expect(noticeResolutionMeaning("collector")).toContain("mailing list");
  });
});
