export const PUBLIC_SITE_ORIGIN = "https://artbyjennefer.manus.space";

export function canonicalUrlForPath(path: string): string {
  const pathname = path.split("?")[0].split("#")[0] || "/";
  return `${PUBLIC_SITE_ORIGIN}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function applyCanonicalMetadata(path: string) {
  const canonicalUrl = canonicalUrlForPath(path);
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (!robots) {
    robots = document.createElement("meta");
    robots.name = "robots";
    document.head.appendChild(robots);
  }
  const isPublicRoute = path === "/" || path === "/gallery" || path.startsWith("/gallery/") || path.startsWith("/artwork/") || path === "/about" || path === "/contact";
  robots.content = isPublicRoute ? "index, follow" : "noindex, nofollow";
  return canonicalUrl;
}
