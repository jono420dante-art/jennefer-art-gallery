import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  Download,
  ExternalLink,
  Globe2,
  MapPinned,
  MousePointerClick,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

function MetricCard({ icon: Icon, label, value, detail, tone }: {
  icon: typeof Activity;
  label: string;
  value: number;
  detail: string;
  tone: string;
}) {
  return (
    <Card className="p-5 bg-card border-border">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
          <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={`rounded-xl p-3 ${tone}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </Card>
  );
}

function EmptyData({ text }: { text: string }) {
  return <p className="py-6 text-sm text-muted-foreground">{text}</p>;
}

export function AdminGrowthPanel() {
  const [days, setDays] = useState(7);
  const [activeTab, setActiveTab] = useState(() => (
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("panel") === "seo"
      ? "seo"
      : "overview"
  ));
  const [runtimeSeo, setRuntimeSeo] = useState({
    homeTitle: "",
    homeDescription: "",
    robots: false,
    sitemap: false,
    structuredData: false,
  });
  const homeAuditFrame = useRef<HTMLIFrameElement>(null);
  const artworkAuditFrame = useRef<HTMLIFrameElement>(null);
  const summaryQuery = trpc.analytics.summary.useQuery(
    { days },
    { refetchInterval: 30_000 },
  );
  const artworksQuery = trpc.artworks.list.useQuery();
  const utils = trpc.useUtils();
  const retentionMutation = trpc.analytics.clearExpired.useMutation({
    onSuccess: () => {
      utils.analytics.summary.invalidate();
      toast.success("Analytics records older than 90 days were removed.");
    },
    onError: (error) => toast.error(error.message || "Could not apply the analytics retention rule."),
  });

  const downloadReport = async () => {
    try {
      const response = await fetch(`/api/admin/analytics-report?days=${days}`, { credentials: "include" });
      if (!response.ok) throw new Error("Could not generate the PDF report.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `jennefer-ann-growth-report-${days}-days.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Your real-data growth report is downloading.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate the PDF report.");
    }
  };

  const openSeoDashboard = () => {
    setActiveTab("seo");
    window.history.replaceState({}, "", `${window.location.pathname}?panel=seo#seo-dashboard`);
    window.setTimeout(() => document.getElementById("seo-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/robots.txt").then(async (response) => ({
        ok: response.ok && (await response.text()).includes("User-agent:"),
      })).catch(() => ({ ok: false })),
      fetch("/sitemap.xml").then(async (response) => ({
        ok: response.ok && (await response.text()).includes("<urlset"),
      })).catch(() => ({ ok: false })),
    ]).then(([robots, sitemap]) => {
      if (active) setRuntimeSeo((current) => ({ ...current, robots: robots.ok, sitemap: sitemap.ok }));
    });
    return () => { active = false; };
  }, []);

  const inspectHomeFrame = () => {
    window.setTimeout(() => {
      const auditDocument = homeAuditFrame.current?.contentDocument;
      setRuntimeSeo((current) => ({
        ...current,
        homeTitle: auditDocument?.title || "",
        homeDescription: auditDocument?.querySelector('meta[name="description"]')?.getAttribute("content") || "",
      }));
    }, 800);
  };

  const inspectArtworkFrame = () => {
    window.setTimeout(() => {
      const auditDocument = artworkAuditFrame.current?.contentDocument;
      setRuntimeSeo((current) => ({
        ...current,
        structuredData: Boolean(auditDocument?.querySelector('script[type="application/ld+json"]')),
      }));
    }, 1_000);
  };

  const seoChecks = useMemo(() => {
    const title = runtimeSeo.homeTitle;
    const description = runtimeSeo.homeDescription;
    const hasAnalyticsTag = Boolean(document.querySelector('script[src*="googletagmanager.com/gtag/js"]'));
    return [
      {
        label: "Homepage title",
        detail: `${title.length} characters — ${title || "Missing"}`,
        ok: title.length >= 30 && title.length <= 60,
      },
      {
        label: "Meta description",
        detail: `${description.length} characters`,
        ok: description.length >= 50 && description.length <= 160,
      },
      { label: "Google Analytics tag", detail: hasAnalyticsTag ? "Present in the public site head" : "Not detected", ok: hasAnalyticsTag },
      { label: "robots.txt", detail: runtimeSeo.robots ? "Verified from /robots.txt" : "Checking the published crawler directives…", ok: runtimeSeo.robots },
      { label: "sitemap.xml", detail: runtimeSeo.sitemap ? "Verified from /sitemap.xml" : "Checking the published sitemap…", ok: runtimeSeo.sitemap },
      {
        label: "Artwork structured data",
        detail: artworksQuery.data?.[0]
          ? (runtimeSeo.structuredData ? "Verified on a rendered public artwork page" : "Checking a rendered public artwork page…")
          : "No artwork is available to audit yet",
        ok: runtimeSeo.structuredData,
      },
    ];
  }, [artworksQuery.data, runtimeSeo]);

  const summary = summaryQuery.data;

  return (
    <Card className="mb-8 overflow-hidden border-border bg-card">
      <iframe ref={homeAuditFrame} src="/" title="Public homepage SEO audit" className="hidden" onLoad={inspectHomeFrame} />
      {artworksQuery.data?.[0] && (
        <iframe
          ref={artworkAuditFrame}
          src={`/artwork/${encodeURIComponent(artworksQuery.data[0].slug)}`}
          title="Public artwork structured-data audit"
          className="hidden"
          onLoad={inspectArtworkFrame}
        />
      )}
      <div className="flex flex-col gap-4 border-b border-border bg-muted/20 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-[0.18em]">Growth Control</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Real traffic, clicks and search readiness</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            First-party analytics updates from real public visits. Numbers begin building from the moment visitors use the site.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Analytics reporting period"
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option value={1}>Today</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => summaryQuery.refetch()} disabled={summaryQuery.isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${summaryQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={downloadReport}>
            <Download className="mr-2 h-4 w-4" />
            PDF report
          </Button>
          <Button variant="outline" size="sm" onClick={openSeoDashboard}>
            <SearchCheck className="mr-2 h-4 w-4" />
            SEO dashboard
          </Button>
        </div>
      </div>

      <div className="p-6">
        <button
          id="seo-dashboard"
          type="button"
          onClick={openSeoDashboard}
          className="mb-5 flex w-full items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/10 p-4 text-left transition hover:border-primary/60 hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span>
            <span className="flex items-center gap-2 font-bold text-foreground"><SearchCheck className="h-5 w-5 text-primary" /> SEO DASHBOARD</span>
            <span className="mt-1 block text-sm text-muted-foreground">Check titles, descriptions, Google Analytics tagging, robots, sitemap, and artwork structured data.</span>
          </span>
          <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">Open SEO health</span>
        </button>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 h-auto w-full justify-start overflow-x-auto bg-muted/40 p-1">
            <TabsTrigger value="overview">Live overview</TabsTrigger>
            <TabsTrigger value="traffic">Traffic & clicks</TabsTrigger>
            <TabsTrigger value="seo">SEO health</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            {summaryQuery.isLoading ? (
              <EmptyData text="Loading recorded visitor data…" />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard icon={Users} label="Unique sessions" value={summary?.uniqueSessions ?? 0} detail={`Real visitors in the selected ${days}-day period`} tone="bg-blue-600" />
                  <MetricCard icon={Globe2} label="Page views" value={summary?.pageViews ?? 0} detail="Recorded public page loads" tone="bg-emerald-600" />
                  <MetricCard icon={MousePointerClick} label="Conversion clicks" value={summary?.conversionClicks ?? 0} detail="Checkout, reserve, WhatsApp, commission and signup interactions" tone="bg-amber-600" />
                  <MetricCard icon={Activity} label="Live now" value={summary?.activeVisitors ?? 0} detail="Sessions active in the last 30 minutes" tone="bg-violet-600" />
                </div>
                <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                  <ShieldCheck className="mr-2 inline h-4 w-4 text-emerald-500" />
                  Privacy-safe first-party tracking stores anonymous session IDs and conversion events. It does not store visitor email addresses or raw IP addresses.
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="traffic" className="mt-0">
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="border-border bg-background p-5">
                <h3 className="flex items-center gap-2 font-semibold text-foreground"><Globe2 className="h-4 w-4 text-primary" /> Traffic sources</h3>
                {summary?.trafficSources?.length ? (
                  <div className="mt-4 space-y-3">
                    {summary.trafficSources.map((item) => (
                      <div key={item.source} className="flex items-center justify-between text-sm">
                        <span className="capitalize text-muted-foreground">{item.source}</span>
                        <span className="font-bold text-foreground">{item.sessions}</span>
                      </div>
                    ))}
                  </div>
                ) : <EmptyData text="Traffic sources will appear after real visitors arrive." />}
              </Card>
              <Card className="border-border bg-background p-5">
                <h3 className="flex items-center gap-2 font-semibold text-foreground"><ExternalLink className="h-4 w-4 text-primary" /> Top referrers</h3>
                {summary?.referrers?.length ? (
                  <div className="mt-4 space-y-3">
                    {summary.referrers.map((item) => (
                      <div key={item.referrerDomain} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-muted-foreground">{item.referrerDomain}</span>
                        <span className="font-bold text-foreground">{item.sessions}</span>
                      </div>
                    ))}
                  </div>
                ) : <EmptyData text="External links, social posts and campaign referrals will appear here." />}
              </Card>
              <Card className="border-border bg-background p-5">
                <h3 className="flex items-center gap-2 font-semibold text-foreground"><BarChart3 className="h-4 w-4 text-primary" /> Most-viewed pages</h3>
                {summary?.topPages?.length ? (
                  <div className="mt-4 space-y-3">
                    {summary.topPages.map((item) => (
                      <div key={item.pagePath} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-muted-foreground">{item.pagePath}</span>
                        <span className="font-bold text-foreground">{item.views}</span>
                      </div>
                    ))}
                  </div>
                ) : <EmptyData text="Top landing and artwork pages will show after public visits are recorded." />}
              </Card>
              <Card className="border-border bg-background p-5">
                <h3 className="flex items-center gap-2 font-semibold text-foreground"><MousePointerClick className="h-4 w-4 text-primary" /> Highest-intent clicks</h3>
                {summary?.topClicks?.length ? (
                  <div className="mt-4 space-y-3">
                    {summary.topClicks.map((item, index) => (
                      <div key={`${item.eventType}-${item.target}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-muted-foreground">{item.eventType.replace("click_", "").replaceAll("_", " ")} {item.target ? `· ${item.target}` : ""}</span>
                        <span className="font-bold text-foreground">{item.clicks}</span>
                      </div>
                    ))}
                  </div>
                ) : <EmptyData text="Buyer-intent interactions will appear once visitors use your sales controls." />}
              </Card>
              <Card className="border-border bg-background p-5">
                <h3 className="flex items-center gap-2 font-semibold text-foreground"><MapPinned className="h-4 w-4 text-primary" /> Geographic view</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">This privacy-safe first-party tracker intentionally does not store raw IP addresses or infer locations. For verified country and city reporting, use the connected Google Analytics property.</p>
                <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80">Open Google Analytics geographic reports <ExternalLink className="ml-1 h-3.5 w-3.5" /></a>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="mt-0">
            <div className="grid gap-4 lg:grid-cols-2">
              {seoChecks.map((check) => (
                <Card key={check.label} className="border-border bg-background p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="flex items-center gap-2 font-semibold text-foreground"><SearchCheck className="h-4 w-4 text-primary" /> {check.label}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{check.detail}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${check.ok ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"}`}>
                      {check.ok ? "Ready" : "Needs attention"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm">Open robots.txt</Button></a>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm">Open sitemap.xml</Button></a>
              <Button variant="outline" size="sm" onClick={() => retentionMutation.mutate({ retentionDays: 90 })} disabled={retentionMutation.isPending}>
                <Trash2 className="mr-2 h-4 w-4" /> Keep 90 days of first-party data
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
