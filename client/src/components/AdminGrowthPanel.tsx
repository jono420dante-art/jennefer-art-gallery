import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  ChartNoAxesCombined,
  Clock3,
  Download,
  ExternalLink,
  Globe2,
  MapPinned,
  Monitor,
  MousePointerClick,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Smartphone,
  Tablet,
  Timer,
  Trash2,
  Users,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type MetricIcon = typeof Activity;

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}

function MetricCard({ icon: Icon, label, value, detail, tone }: { icon: MetricIcon; label: string; value: string | number; detail: string; tone: string }) {
  return (
    <Card className="min-w-0 rounded-xl border border-white/8 bg-[#101217] p-4 shadow-[0_16px_32px_-28px_rgba(0,0,0,0.95)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p>
          <p className="mt-2 break-words text-3xl font-black tracking-tight text-white">{value}</p>
          <p className="mt-2 min-h-8 break-words text-xs leading-4 text-slate-400">{detail}</p>
        </div>
        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4 text-white" /></div>
      </div>
    </Card>
  );
}

function EmptyData({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-4 text-center text-sm leading-6 text-slate-400">{text}</p>;
}

function SignalRows({ items, labelKey, valueKey, formatLabel }: { items: any[]; labelKey: string; valueKey: string; formatLabel?: (item: any) => string }) {
  const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 0);
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const value = Number(item[valueKey]) || 0;
        return (
          <div key={`${item[labelKey]}-${index}`}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="min-w-0 truncate capitalize text-slate-400">{formatLabel ? formatLabel(item) : item[labelKey]}</span>
              <strong className="shrink-0 text-slate-100">{value.toLocaleString()}</strong>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400" style={{ width: `${max ? (value / max) * 100 : 0}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}

function TrafficTrend({ dailyTraffic }: { dailyTraffic: Array<{ date: string; sessions: number; pageViews: number; conversionClicks: number }> }) {
  const max = Math.max(...dailyTraffic.flatMap((entry) => [entry.sessions, entry.pageViews]), 1);
  const width = 640;
  const height = 180;
  const pointString = (key: "sessions" | "pageViews") => dailyTraffic.map((entry, index) => {
    const x = dailyTraffic.length <= 1 ? width / 2 : (index / (dailyTraffic.length - 1)) * width;
    const y = height - ((entry[key] / max) * (height - 16) + 8);
    return `${x},${y}`;
  }).join(" ");
  const hasTraffic = dailyTraffic.some((entry) => entry.sessions || entry.pageViews);

  return (
    <Card className="min-w-0 rounded-xl border border-white/8 bg-[#101217] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><div className="flex items-center gap-2"><ChartNoAxesCombined className="h-4 w-4 text-cyan-300" /><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Trend signal</p></div><h3 className="mt-2 text-base font-black text-white">Sessions & page views</h3><p className="mt-1 text-xs text-slate-400">Real public activity across the selected period.</p></div>
        <div className="flex gap-3 text-[10px] font-bold uppercase tracking-[0.12em]"><span className="flex items-center gap-1.5 text-blue-300"><i className="h-2 w-2 rounded-full bg-blue-400" />Sessions</span><span className="flex items-center gap-1.5 text-cyan-300"><i className="h-2 w-2 rounded-full bg-cyan-400" />Views</span></div>
      </div>
      {hasTraffic ? <><div className="mt-5 h-44 overflow-hidden rounded-lg border border-white/6 bg-[linear-gradient(180deg,rgba(59,130,246,0.08),transparent_78%)] p-3"><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Recorded sessions and page-view trend"><path d={`M0 ${height - 8} H${width}`} stroke="rgba(255,255,255,0.13)" strokeDasharray="6 7" /><path d={`M0 ${height * 0.5} H${width}`} stroke="rgba(255,255,255,0.09)" strokeDasharray="6 7" /><polyline fill="none" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={pointString("sessions")} /><polyline fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pointString("pageViews")} /></svg></div><div className="mt-2 grid grid-cols-7 gap-1 text-center text-[9px] font-semibold uppercase tracking-wide text-slate-500">{dailyTraffic.map((entry) => <span key={entry.date}>{new Date(`${entry.date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: "short" })}</span>)}</div></> : <div className="mt-5"><EmptyData text="The trend draws from recorded visits and will appear once public sessions arrive." /></div>}
    </Card>
  );
}

function DeviceMix({ deviceMix }: { deviceMix: Array<{ device: string; sessions: number; percentage: number }> }) {
  const colors: Record<string, string> = { desktop: "#60a5fa", mobile: "#a78bfa", tablet: "#2dd4bf", unknown: "#64748b" };
  const total = deviceMix.reduce((sum, item) => sum + item.sessions, 0);
  let cursor = 0;
  const gradient = deviceMix.length ? `conic-gradient(${deviceMix.map((item) => { const start = cursor; cursor += item.percentage; return `${colors[item.device] ?? colors.unknown} ${start}% ${cursor}%`; }).join(", ")})` : "conic-gradient(#334155 0% 100%)";
  const iconForDevice = (device: string) => device === "mobile" ? Smartphone : device === "tablet" ? Tablet : device === "desktop" ? Monitor : Users;
  return (
    <Card className="min-w-0 rounded-xl border border-white/8 bg-[#101217] p-4 sm:p-5"><div className="flex items-center gap-2"><Monitor className="h-4 w-4 text-violet-300" /><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Audience tech</p><h3 className="mt-1 text-base font-black text-white">Device mix</h3></div></div>{total ? <div className="mt-5 grid grid-cols-[110px_1fr] items-center gap-5"><div className="relative grid h-28 w-28 place-items-center rounded-full" style={{ background: gradient }}><div className="grid h-20 w-20 place-items-center rounded-full bg-[#101217] text-center"><strong className="text-2xl font-black text-white">{total}</strong><span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">sessions</span></div></div><div className="space-y-3">{deviceMix.map((item) => { const Icon = iconForDevice(item.device); return <div key={item.device} className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2 capitalize text-slate-400"><Icon className="h-3.5 w-3.5 shrink-0" style={{ color: colors[item.device] ?? colors.unknown }} />{item.device}</span><strong className="shrink-0 text-slate-100">{item.percentage}%</strong></div>; })}</div></div> : <div className="mt-5"><EmptyData text="Device mix will populate from new first-party visitor sessions." /></div>}</Card>
  );
}

export function AdminGrowthPanel() {
  const [days, setDays] = useState(7);
  const [activeTab, setActiveTab] = useState(() => (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("panel") === "seo" ? "seo" : "overview"));
  const [runtimeSeo, setRuntimeSeo] = useState({ homeTitle: "", homeDescription: "", robots: false, sitemap: false, structuredData: false });
  const homeAuditFrame = useRef<HTMLIFrameElement>(null);
  const artworkAuditFrame = useRef<HTMLIFrameElement>(null);
  const summaryQuery = trpc.analytics.summary.useQuery({ days }, { refetchInterval: 30_000 });
  const artworksQuery = trpc.artworks.list.useQuery();
  const utils = trpc.useUtils();
  const retentionMutation = trpc.analytics.clearExpired.useMutation({ onSuccess: () => { utils.analytics.summary.invalidate(); toast.success("Analytics records older than 90 days were removed."); }, onError: (error) => toast.error(error.message || "Could not apply the analytics retention rule.") });
  const downloadReport = async () => { try { const response = await fetch(`/api/admin/analytics-report?days=${days}`, { credentials: "include" }); if (!response.ok) throw new Error("Could not generate the PDF report."); const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = `jennefer-ann-growth-report-${days}-days.pdf`; link.click(); URL.revokeObjectURL(url); toast.success("Your real-data growth report is downloading."); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not generate the PDF report."); } };
  const openSeoDashboard = () => { setActiveTab("seo"); window.history.replaceState({}, "", `${window.location.pathname}?panel=seo#seo-dashboard`); window.setTimeout(() => document.getElementById("seo-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); };
  useEffect(() => { let active = true; Promise.all([fetch("/robots.txt").then(async (response) => ({ ok: response.ok && (await response.text()).includes("User-agent:") })).catch(() => ({ ok: false })), fetch("/sitemap.xml").then(async (response) => ({ ok: response.ok && (await response.text()).includes("<urlset") })).catch(() => ({ ok: false }))]).then(([robots, sitemap]) => { if (active) setRuntimeSeo((current) => ({ ...current, robots: robots.ok, sitemap: sitemap.ok })); }); return () => { active = false; }; }, []);
  const inspectHomeFrame = () => { window.setTimeout(() => { const auditDocument = homeAuditFrame.current?.contentDocument; setRuntimeSeo((current) => ({ ...current, homeTitle: auditDocument?.title || "", homeDescription: auditDocument?.querySelector('meta[name="description"]')?.getAttribute("content") || "" })); }, 800); };
  const inspectArtworkFrame = () => { window.setTimeout(() => { const auditDocument = artworkAuditFrame.current?.contentDocument; setRuntimeSeo((current) => ({ ...current, structuredData: Boolean(auditDocument?.querySelector('script[type="application/ld+json"]')) })); }, 1_000); };
  const seoChecks = useMemo(() => { const title = runtimeSeo.homeTitle; const description = runtimeSeo.homeDescription; const hasAnalyticsTag = Boolean(document.querySelector('script[src*="googletagmanager.com/gtag/js"]')); return [{ label: "Homepage title", detail: `${title.length} characters — ${title || "Missing"}`, ok: title.length >= 30 && title.length <= 60 }, { label: "Meta description", detail: `${description.length} characters`, ok: description.length >= 50 && description.length <= 160 }, { label: "Google Analytics tag", detail: hasAnalyticsTag ? "Present in the public site head" : "Not detected", ok: hasAnalyticsTag }, { label: "robots.txt", detail: runtimeSeo.robots ? "Verified from /robots.txt" : "Checking published crawler directives…", ok: runtimeSeo.robots }, { label: "sitemap.xml", detail: runtimeSeo.sitemap ? "Verified from /sitemap.xml" : "Checking published sitemap…", ok: runtimeSeo.sitemap }, { label: "Artwork structured data", detail: artworksQuery.data?.[0] ? (runtimeSeo.structuredData ? "Verified on a rendered public artwork page" : "Checking a rendered public artwork page…") : "No artwork is available to audit yet", ok: runtimeSeo.structuredData }]; }, [artworksQuery.data, runtimeSeo]);
  const summary = summaryQuery.data;
  const deviceMix = summary?.deviceMix ?? [];
  const engagementSignals = summary?.engagementSignals ?? [];

  return <Card className="overflow-hidden rounded-xl border border-white/8 bg-[#15171c] text-slate-100"><iframe ref={homeAuditFrame} src="/" title="Public homepage SEO audit" className="hidden" onLoad={inspectHomeFrame} />{artworksQuery.data?.[0] && <iframe ref={artworkAuditFrame} src={`/artwork/${encodeURIComponent(artworksQuery.data[0].slug)}`} title="Public artwork structured-data audit" className="hidden" onLoad={inspectArtworkFrame} />}<div className="flex flex-col gap-5 border-b border-white/8 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.14),transparent_42%),#101217] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="mb-2 flex items-center gap-2 text-cyan-300"><BarChart3 className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[0.17em]">Gallery analytics cockpit</span></div><h2 className="text-xl font-black tracking-tight text-white">Traffic, attention & collector intent</h2><p className="mt-1 max-w-2xl break-words text-xs leading-5 text-slate-400">GA4-inspired operational visibility, powered by privacy-safe first-party activity. Geography remains deliberately separate until verified GA4 data access is connected.</p></div><div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap"><select aria-label="Analytics reporting period" value={days} onChange={(event) => setDays(Number(event.target.value))} className="h-9 w-full rounded-md border border-white/12 bg-[#191c22] px-3 text-xs text-slate-100 sm:w-auto"><option value={1}>Today</option><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option></select><Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08] hover:text-white" onClick={() => summaryQuery.refetch()} disabled={summaryQuery.isFetching}><RefreshCw className={`mr-2 h-3.5 w-3.5 ${summaryQuery.isFetching ? "animate-spin" : ""}`} />Refresh</Button><Button size="sm" className="bg-violet-600 text-white hover:bg-violet-500" onClick={downloadReport}><Download className="mr-2 h-3.5 w-3.5" />PDF report</Button><Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08] hover:text-white" onClick={openSeoDashboard}><SearchCheck className="mr-2 h-3.5 w-3.5" />SEO health</Button></div></div><div className="p-4 sm:p-5"><button id="seo-dashboard" type="button" onClick={openSeoDashboard} className="mb-5 flex w-full flex-col items-start justify-between gap-3 rounded-lg border border-violet-400/25 bg-violet-500/10 p-4 text-left transition hover:border-violet-400/50 hover:bg-violet-500/15 focus:outline-none focus:ring-2 focus:ring-violet-400 sm:flex-row sm:items-center"><span><span className="flex items-center gap-2 text-sm font-bold text-white"><SearchCheck className="h-4 w-4 text-violet-300" />SEO DASHBOARD</span><span className="mt-1 block text-xs leading-5 text-slate-400">Audit titles, descriptions, Google Analytics tagging, crawler directives, sitemap and artwork structured data.</span></span><span className="shrink-0 rounded-full bg-violet-500 px-3 py-1.5 text-[10px] font-bold tracking-wide text-white">Open SEO health</span></button><Tabs value={activeTab} onValueChange={setActiveTab}><TabsList className="mb-5 flex h-auto w-full justify-start overflow-x-auto rounded-lg bg-white/[0.04] p-1 [scrollbar-width:thin]"><TabsTrigger className="shrink-0 data-[state=active]:bg-[#262936] data-[state=active]:text-white" value="overview">Performance</TabsTrigger><TabsTrigger className="shrink-0 data-[state=active]:bg-[#262936] data-[state=active]:text-white" value="traffic">Audience & interest</TabsTrigger><TabsTrigger className="shrink-0 data-[state=active]:bg-[#262936] data-[state=active]:text-white" value="geo">Geographic view</TabsTrigger><TabsTrigger className="shrink-0 data-[state=active]:bg-[#262936] data-[state=active]:text-white" value="seo">SEO health</TabsTrigger></TabsList><TabsContent value="overview" className="mt-0">{summaryQuery.isLoading ? <EmptyData text="Loading recorded visitor data…" /> : <><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"><MetricCard icon={Users} label="Sessions" value={summary?.uniqueSessions ?? 0} detail={`Real visitors in the selected ${days}-day period`} tone="bg-blue-600" /><MetricCard icon={Globe2} label="Page views" value={summary?.pageViews ?? 0} detail="Recorded public page loads" tone="bg-emerald-600" /><MetricCard icon={MousePointerClick} label="Conversion actions" value={summary?.conversionClicks ?? 0} detail="Checkout, reserve, WhatsApp, commission and signup actions" tone="bg-amber-600" /><MetricCard icon={Clock3} label="Average engagement" value={formatDuration(summary?.averageEngagementSeconds ?? 0)} detail="Observed visible-session time from first-party session activity" tone="bg-violet-600" /><MetricCard icon={Activity} label="Engagement rate" value={`${summary?.engagementRate ?? 0}%`} detail="Session with 60s activity, 2 page views, or a conversion action" tone="bg-rose-600" /><MetricCard icon={Timer} label="Events per session" value={summary?.eventsPerSession ?? 0} detail="Recorded views, heartbeat, engagement and conversion events" tone="bg-cyan-600" /></div><div className="mt-4 grid gap-3 xl:grid-cols-[1.45fr_0.55fr]"><TrafficTrend dailyTraffic={summary?.dailyTraffic ?? []} /><DeviceMix deviceMix={deviceMix} /></div><div className="mt-4 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] p-3 text-xs leading-5 text-slate-400"><ShieldCheck className="mr-2 inline h-4 w-4 text-emerald-300" />First-party measurement stores anonymous session identifiers and aggregated behaviour. It does not store visitor email addresses, raw IP addresses, or inferred locations.</div></>}</TabsContent><TabsContent value="traffic" className="mt-0"><div className="grid gap-3 lg:grid-cols-2"><Card className="rounded-xl border border-white/8 bg-[#101217] p-4"><h3 className="flex items-center gap-2 text-sm font-bold text-white"><Globe2 className="h-4 w-4 text-cyan-300" />Traffic sources</h3><p className="mt-1 text-xs text-slate-500">How visitors arrive.</p><div className="mt-5">{summary?.trafficSources?.length ? <SignalRows items={summary.trafficSources} labelKey="source" valueKey="sessions" /> : <EmptyData text="Traffic sources will appear after real visitors arrive." />}</div></Card><Card className="rounded-xl border border-white/8 bg-[#101217] p-4"><h3 className="flex items-center gap-2 text-sm font-bold text-white"><ExternalLink className="h-4 w-4 text-cyan-300" />Top referrers</h3><p className="mt-1 text-xs text-slate-500">External pages and campaigns sending visitors.</p><div className="mt-5">{summary?.referrers?.length ? <SignalRows items={summary.referrers} labelKey="referrerDomain" valueKey="sessions" /> : <EmptyData text="External links and campaign referrals will appear here." />}</div></Card><Card className="rounded-xl border border-white/8 bg-[#101217] p-4"><h3 className="flex items-center gap-2 text-sm font-bold text-white"><BarChart3 className="h-4 w-4 text-cyan-300" />What collectors are viewing</h3><p className="mt-1 text-xs text-slate-500">Most-viewed gallery and artwork pages.</p><div className="mt-5">{summary?.topPages?.length ? <SignalRows items={summary.topPages} labelKey="pagePath" valueKey="views" /> : <EmptyData text="Content interest will show after public pages are viewed." />}</div></Card><Card className="rounded-xl border border-white/8 bg-[#101217] p-4"><h3 className="flex items-center gap-2 text-sm font-bold text-white"><MousePointerClick className="h-4 w-4 text-cyan-300" />What they engage with</h3><p className="mt-1 text-xs text-slate-500">Artwork interest, deep scrolls, and buyer-intent actions.</p><div className="mt-5">{engagementSignals.length ? <SignalRows items={engagementSignals} labelKey="eventType" valueKey="events" formatLabel={(item) => item.eventType.replace("click_", "").replaceAll("_", " ")} /> : <EmptyData text="Engagement signals will populate as visitors browse and interact." />}</div></Card><Card className="rounded-xl border border-white/8 bg-[#101217] p-4 lg:col-span-2"><h3 className="flex items-center gap-2 text-sm font-bold text-white"><MousePointerClick className="h-4 w-4 text-violet-300" />Highest-intent buyer actions</h3><p className="mt-1 text-xs text-slate-500">Checkout, reserve, WhatsApp, commission and collector-list actions.</p><div className="mt-5">{summary?.topClicks?.length ? <SignalRows items={summary.topClicks} labelKey="eventType" valueKey="clicks" formatLabel={(item) => `${item.eventType.replace("click_", "").replaceAll("_", " ")}${item.target ? ` · ${item.target}` : ""}`} /> : <EmptyData text="Buyer-intent interactions will appear when visitors use your sales controls." />}</div></Card></div></TabsContent><TabsContent value="geo" className="mt-0"><div className="grid gap-3 lg:grid-cols-[1.35fr_0.65fr]"><Card className="relative min-h-72 overflow-hidden rounded-xl border border-white/8 bg-[#101217] p-5"><div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(96,165,250,0.25) 1px, transparent 1px)", backgroundSize: "22px 22px" }} /><div className="relative"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-cyan-300" /><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Verified geography</p></div><h3 className="mt-2 text-lg font-black text-white">Visitor locations map</h3></div><span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-300">GA4 DATA CONNECTION REQUIRED</span></div><div className="mt-12 max-w-md"><p className="text-sm leading-6 text-slate-300">Country and city points will appear here only after a Google Analytics Data API connection is authorised.</p><p className="mt-2 text-xs leading-5 text-slate-500">The gallery’s first-party tracker intentionally does not collect raw IP addresses or infer a visitor&apos;s location, so it cannot honestly fabricate geographic dots.</p><a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center text-xs font-bold text-cyan-300 hover:text-cyan-200">Open GA4 geographic reports <ExternalLink className="ml-1 h-3.5 w-3.5" /></a></div></div></Card><Card className="rounded-xl border border-white/8 bg-[#101217] p-5"><div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-violet-300" /><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Connection status</p><h3 className="mt-1 text-base font-black text-white">GA4 location feed</h3></div></div><div className="mt-6 space-y-4"><div className="rounded-lg border border-white/8 bg-white/[0.02] p-3"><p className="text-xs font-bold text-slate-300">Tracking tag</p><p className="mt-1 text-xs text-emerald-300">Present on the public site</p></div><div className="rounded-lg border border-white/8 bg-white/[0.02] p-3"><p className="text-xs font-bold text-slate-300">Data API authorisation</p><p className="mt-1 text-xs text-amber-300">Not connected in this project</p></div><p className="text-xs leading-5 text-slate-500">Connect the Google Analytics Data API to unlock country, city and verified geographic map points inside this portal.</p></div></Card></div></TabsContent><TabsContent value="seo" className="mt-0"><div className="grid gap-3 lg:grid-cols-2">{seoChecks.map((check) => <Card key={check.label} className="rounded-lg border border-white/8 bg-[#101217] p-4"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h3 className="flex items-center gap-2 text-sm font-bold text-white"><SearchCheck className="h-4 w-4 text-violet-300" />{check.label}</h3><p className="mt-2 break-words text-xs leading-5 text-slate-400">{check.detail}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${check.ok ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"}`}>{check.ok ? "Ready" : "Needs attention"}</span></div></Card>)}</div><div className="mt-5 flex flex-wrap gap-2"><a href="/robots.txt" target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08] hover:text-white">Open robots.txt</Button></a><a href="/sitemap.xml" target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08] hover:text-white">Open sitemap.xml</Button></a><Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08] hover:text-white" onClick={() => retentionMutation.mutate({ retentionDays: 90 })} disabled={retentionMutation.isPending}><Trash2 className="mr-2 h-3.5 w-3.5" />Keep 90 days of data</Button></div></TabsContent></Tabs></div></Card>;
}
