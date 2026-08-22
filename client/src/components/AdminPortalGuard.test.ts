import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useAuthMock = vi.fn();

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/admin-dashboard", vi.fn()],
}));

import { AdminPortalGuard } from "./AdminPortalGuard";

const renderGuard = () => renderToStaticMarkup(
  createElement(AdminPortalGuard, null, createElement("div", null, "Protected dashboard content")),
);

describe("AdminPortalGuard", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("renders the secure sign-in gate and hides protected content for logged-out visitors", () => {
    useAuthMock.mockReturnValue({ user: null, loading: false, logout: vi.fn() });

    const markup = renderGuard();
    expect(markup).toContain("Secure sign-in required");
    expect(markup).not.toContain("Protected dashboard content");
  });

  it("denies protected content to a signed-in user without the Administrator role", () => {
    useAuthMock.mockReturnValue({
      user: { id: 10, name: "Gallery visitor", role: "user" },
      loading: false,
      logout: vi.fn(),
    });

    const markup = renderGuard();
    expect(markup).toContain("Administrator access required");
    expect(markup).not.toContain("Protected dashboard content");
  });

  it("renders protected content only for a verified Administrator role", () => {
    useAuthMock.mockReturnValue({
      user: { id: 1, name: "Gallery administrator", role: "admin" },
      loading: false,
      logout: vi.fn(),
    });

    expect(renderGuard()).toContain("Protected dashboard content");
  });

  it.each([
    { id: 1, name: "Jennefer", email: "jennefer@example.com" },
    { id: 42, name: "Studio assistant", email: "assistant@example.com" },
  ])("shares the same protected workspace with Administrator identity %#", (administrator) => {
    useAuthMock.mockReturnValue({
      user: { ...administrator, role: "admin" },
      loading: false,
      logout: vi.fn(),
    });

    expect(renderGuard()).toContain("Protected dashboard content");
  });
});
