import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

type AnalyticsEventType =
  | "page_view"
  | "heartbeat"
  | "click_artwork"
  | "click_checkout"
  | "click_reserve"
  | "click_whatsapp"
  | "click_commission"
  | "click_newsletter"
  | "click_share";

type TrackerContext = {
  sessionId: string;
  landingPath: string;
  referrerDomain?: string;
  source: string;
  medium?: string;
  campaign?: string;
  deviceType: "mobile" | "tablet" | "desktop" | "unknown";
};

const SESSION_KEY = "jennefer_gallery_analytics_session";
const LANDING_PATH_KEY = "jennefer_gallery_analytics_landing_path";

function getSessionId() {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const value = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().replaceAll("-", "")
    : `${Date.now()}${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem(SESSION_KEY, value);
  return value;
}

function getDeviceType(): TrackerContext["deviceType"] {
  const width = window.innerWidth;
  if (width <= 767) return "mobile";
  if (width <= 1024) return "tablet";
  if (width > 1024) return "desktop";
  return "unknown";
}

function resolveTrafficContext(pathname: string): TrackerContext {
  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer ? new URL(document.referrer) : undefined;
  const referrerDomain = referrer?.hostname || undefined;
  const utmSource = params.get("utm_source") || undefined;
  const source = utmSource || (referrerDomain ? "referral" : "direct");
  const landingPath = sessionStorage.getItem(LANDING_PATH_KEY) || pathname;
  sessionStorage.setItem(LANDING_PATH_KEY, landingPath);

  return {
    sessionId: getSessionId(),
    landingPath,
    referrerDomain,
    source,
    medium: params.get("utm_medium") || undefined,
    campaign: params.get("utm_campaign") || undefined,
    deviceType: getDeviceType(),
  };
}

export function useAnalytics() {
  const [location] = useLocation();
  const { mutate } = trpc.analytics.track.useMutation();
  const locationRef = useRef(location);
  const contextRef = useRef<TrackerContext | null>(null);
  const mutateRef = useRef(mutate);

  useEffect(() => {
    locationRef.current = location;
    contextRef.current = location.startsWith("/admin") ? null : resolveTrafficContext(location);
  }, [location]);

  useEffect(() => {
    mutateRef.current = mutate;
  }, [mutate]);

  const trackEvent = useCallback((
    eventType: AnalyticsEventType,
    target?: string,
    artworkId?: number,
  ) => {
    const currentLocation = locationRef.current;
    if (currentLocation.startsWith("/admin")) return;
    const currentContext = contextRef.current || resolveTrafficContext(currentLocation);
    mutateRef.current({
      ...currentContext,
      eventType,
      pagePath: currentLocation,
      target,
      artworkId,
    });
  }, []);

  return { trackEvent };
}

/** Renders no UI and records visits, active sessions, and marked conversion links. */
export function AnalyticsTracker() {
  const { trackEvent } = useAnalytics();
  const [location] = useLocation();

  useEffect(() => {
    if (window.self !== window.top) return;
    if (location.startsWith("/admin")) return;
    trackEvent("page_view");

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        trackEvent("heartbeat");
      }
    }, 60_000);

    const handleClick = (event: MouseEvent) => {
      const element = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-analytics-event], a[href]")
        : null;
      if (!element) return;

      const markedEvent = element.dataset.analyticsEvent as AnalyticsEventType | undefined;
      const href = element instanceof HTMLAnchorElement ? element.href : "";
      const artworkId = Number(element.dataset.artworkId) || undefined;

      if (markedEvent) {
        trackEvent(markedEvent, element.dataset.analyticsTarget || href, artworkId);
      } else if (href.includes("/artwork/")) {
        trackEvent("click_artwork", href, artworkId);
      } else if (href.includes("/checkout/")) {
        trackEvent("click_checkout", href, artworkId);
      } else if (href.includes("wa.me")) {
        trackEvent("click_whatsapp", href, artworkId);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener("click", handleClick, true);
    };
  }, [location, trackEvent]);

  return null;
}
