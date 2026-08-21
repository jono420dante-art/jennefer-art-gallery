import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Eye,
  FileImage,
  ImagePlus,
  Layers3,
  MailCheck,
  MapPinned,
  MousePointerClick,
  Palette,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { NotificationsPanel, type OperationalNotification } from "@/components/NotificationsPanel";
import { AdminGrowthPanel } from "@/components/AdminGrowthPanel";
import { toast } from "sonner";

const PANEL = "border border-cyan-100/15 bg-[linear-gradient(145deg,rgba(11,88,88,0.92),rgba(5,52,56,0.94))] shadow-[0_20px_45px_-35px_rgba(0,0,0,0.95)]";
let collectorTrafficSnapshot: { visitors: number; pageViews: number; dailyTraffic: Array<{ date?: string; pageViews?: number }> } | null = null;

function MiniBars({ values, tint = "bg-cyan-300" }: { values: number[]; tint?: string }) {
  const maximum = Math.max(...values, 0);
  if (maximum === 0) return <span className="text-xs text-teal-100/55">Awaiting real data</span>;
  return <div className="flex h-24 items-end gap-1.5" aria-hidden="true">{values.map((value, index) => <i key={index} className={`min-w-1 flex-1 rounded-t-sm ${tint}`} style={{ height: `${Math.max(9, (value / maximum) * 100)}%`, opacity: 0.38 + ((index + 1) / values.length) * 0.62 }} />)}</div>;
}

function DailyTrafficHoverChart({ dailyTraffic }: { dailyTraffic: Array<{ date?: string; pageViews?: number }> }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const values = dailyTraffic.map((entry) => Number(entry.pageViews) || 0);
  const maximum = Math.max(...values, 0);
  if (!maximum) return <p className="mt-4 border-t border-cyan-100/10 pt-4 text-xs text-teal-100/55">Awaiting real daily traffic</p>;
  const active = activeIndex === null ? null : dailyTraffic[activeIndex];
  const label = active?.date ? new Date(`${active.date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) : "Recorded day";
  return <div className="relative mt-4 border-t border-cyan-100/10 pt-4"><div className="mb-2 flex justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-50/50">Daily page views</p><p className="text-[10px] text-teal-50/55">Hover or drag a bar</p></div><div className="relative flex h-24 items-end gap-1.5" onPointerLeave={() => setActiveIndex(null)} onPointerUp={() => setActiveIndex(null)}>{values.map((value, index) => <button key={dailyTraffic[index]?.date ?? index} type="button" className="group flex h-full min-w-0 flex-1 items-end" aria-label={`${dailyTraffic[index]?.date ?? "Recorded day"}: ${value} page views`} onPointerEnter={() => setActiveIndex(index)} onPointerDown={() => setActiveIndex(index)} onPointerMove={() => setActiveIndex(index)}><i className="w-full rounded-t-sm bg-cyan-200 transition group-hover:bg-cyan-100" style={{ height: `${Math.max(9, (value / maximum) * 100)}%`, opacity: activeIndex === null || activeIndex === index ? 1 : 0.35 }} /></button>)}{active && <div role="status" className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-cyan-100/20 bg-[#021f24] px-2.5 py-1.5 text-xs font-bold text-white shadow-xl">{label} · {(Number(active.pageViews) || 0).toLocaleString()} views</div>}</div></div>;
}

function CollectorPerformanceContent() {
  const metrics = collectorTrafficSnapshot;
  if (!metrics) return null;
  return <><div className="grid grid-cols-2 gap-3"><div><p className="text-xs text-teal-50/60">Visitors</p><p className="mt-1 text-3xl font-black text-white">{metrics.visitors.toLocaleString()}</p><p className="mt-1 text-[11px] text-teal-50/55">Real unique sessions</p></div><div><p className="text-xs text-teal-50/60">Page views</p><p className="mt-1 text-3xl font-black text-white">{metrics.pageViews.toLocaleString()}</p><p className="mt-1 text-[11px] text-teal-50/55">Real public page loads</p></div></div><DailyTrafficHoverChart dailyTraffic={metrics.dailyTraffic} /></>;
}

function ExecutivePanel({ eyebrow, title, icon: Icon, children, className = "" }: { eyebrow: string; title: string; icon: typeof TrendingUp; children: React.ReactNode; className?: string }) {
  return <Card className={`${PANEL} min-w-0 overflow-hidden rounded-2xl p-4 text-teal-50 sm:p-5 ${className}`}><div className="mb-4 flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-cyan-100/55">{eyebrow}</p><h2 className="mt-1 break-words text-base font-black tracking-tight text-white sm:text-lg">{title}</h2></div><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-100/15 bg-cyan-200/10"><Icon className="h-4 w-4 text-cyan-200" /></div></div>{title === "Collector performance" ? <CollectorPerformanceContent /> : children}</Card>;
}

function FunnelStep({ label, value, percent, accent }: { label: string; value: number; percent: number; accent: string }) {
  return <div><div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="min-w-0 truncate text-teal-50/80">{label}</span><strong className="shrink-0 text-white">{value.toLocaleString()}</strong></div><div className="h-9 overflow-hidden rounded-md bg-[#063a3e]"><div className={`flex h-full min-w-10 items-center justify-end rounded-md px-3 text-[10px] font-bold text-white ${accent}`} style={{ width: `${Math.max(8, percent)}%` }}>{percent.toFixed(1)}%</div></div></div>;
}

function AttentionRows({ items }: { items: Array<{ label: string; value: number }> }) {
  const maximum = Math.max(...items.map((item) => item.value), 0);
  if (!items.length) return <p className="rounded-xl border border-dashed border-cyan-100/15 bg-black/10 p-4 text-center text-xs leading-5 text-teal-50/60">Attention signals will appear when public visitors browse artworks and use the sales controls.</p>;
  return <div className="space-y-3">{items.slice(0, 5).map((item) => <div key={item.label}><div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="min-w-0 truncate text-teal-50/80">{item.label}</span><strong className="shrink-0 text-cyan-100">{item.value.toLocaleString()}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-black/20"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${maximum ? (item.value / maximum) * 100 : 0}%` }} /></div></div>)}</div>;
}

export default function AdminDashboard() {
  const [seoReady, setSeoReady] = useState({ tag: false, robots: false, sitemap: false });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const artworksQuery = trpc.artworks.list.useQuery();
  const dashboardQuery = trpc.dashboard.summary.useQuery({ days: 30 }, { refetchInterval: 30_000 });
  const spotlightQuery = trpc.dashboard.spotlight.useQuery();
  const notificationsQuery = trpc.notifications.list.useQuery();
  const utils = trpc.useUtils();
  const selectSpotlightMutation = trpc.dashboard.selectSpotlightArtwork.useMutation({ onSuccess: () => { utils.dashboard.spotlight.invalidate(); toast.success("Artwork selected for Jennefer’s admin profile card."); }, onError: (error) => toast.error(error.message) });
  const uploadSpotlightMutation = trpc.dashboard.uploadSpotlightImage.useMutation({ onSuccess: () => { utils.dashboard.spotlight.invalidate(); toast.success("Custom image saved for Jennefer’s admin profile card."); }, onError: (error) => toast.error(error.message || "Could not upload the image.") });
  const markEventRead = trpc.notifications.markRead.useMutation({ onSuccess: () => utils.notifications.list.invalidate() });
  const markAllEventsRead = trpc.notifications.markAllRead.useMutation({ onSuccess: () => utils.notifications.list.invalidate() });

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/robots.txt").then((response) => response.ok).catch(() => false),
      fetch("/sitemap.xml").then((response) => response.ok).catch(() => false),
    ]).then(([robots, sitemap]) => { if (active) setSeoReady({ tag: Boolean(document.querySelector('script[src*="googletagmanager.com/gtag/js"]')), robots, sitemap }); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const manageArtworkLink = Array.from(document.querySelectorAll<HTMLAnchorElement>("a")).find((link) => link.textContent?.trim() === "Manage artwork");
    if (!manageArtworkLink || manageArtworkLink.parentElement?.querySelector("#gmail-connect-quick-action")) return;
    const gmailLink = document.createElement("a");
    gmailLink.id = "gmail-connect-quick-action";
    gmailLink.href = "/admin/newsletter-studio";
    gmailLink.className = "inline-flex h-10 items-center justify-center rounded-md border border-cyan-100/25 bg-cyan-50/10 px-4 text-sm font-medium text-cyan-50 transition hover:bg-cyan-50/20 hover:text-white";
    gmailLink.setAttribute("aria-label", "Connect Jennefer’s Gmail account for Newsletter Studio delivery");
    gmailLink.textContent = "Connect Gmail";
    manageArtworkLink.insertAdjacentElement("afterend", gmailLink);
    return () => gmailLink.remove();
  }, []);

  const handleSpotlightUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Choose an image file for the profile background."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Use an image smaller than 5 MB for the profile background."); return; }
    const reader = new FileReader();
    reader.onloadend = () => uploadSpotlightMutation.mutate({ imageBase64: String(reader.result) });
    reader.onerror = () => toast.error("The selected image could not be read.");
    reader.readAsDataURL(file);
  };

  const summary = dashboardQuery.data;
  const analytics = summary?.analytics;
  const newsletters = summary?.newsletter;
  const sales = summary?.sales;
  const spotlightImage = spotlightQuery.data?.spotlightImageUrl;
  const dailyTraffic = analytics?.dailyTraffic ?? [];
  const monthlySignups = newsletters?.monthly ?? [];
  const totalViews = analytics?.pageViews ?? 0;
  const artworkViews = analytics?.artworkDetailViews ?? 0;
  const intentClicks = analytics?.highIntentClicks ?? 0;
  const completedSales = sales?.completedOrders ?? 0;
  const pageAttention = (analytics?.topPages ?? []).map((page: any) => ({ label: page.pagePath, value: Number(page.views) || 0 }));
  const eventAttention = (analytics?.engagementSignals ?? []).map((event: any) => ({ label: event.eventType.replace("click_", "").replaceAll("_", " "), value: Number(event.events) || 0 }));
  const operationalNotifications = useMemo<OperationalNotification[]>(() => (notificationsQuery.data ?? []).map((event: any) => ({ id: event.id, title: event.title, body: event.body, type: event.type, timestamp: event.createdAt, isRead: event.isRead })), [notificationsQuery.data]);
  collectorTrafficSnapshot = { visitors: analytics?.uniqueSessions ?? 0, pageViews: totalViews, dailyTraffic };

  return <div className="min-h-screen bg-[#042d31] pb-14 text-teal-50 selection:bg-cyan-300/30"><section className="border-b border-cyan-100/10 bg-[radial-gradient(ellipse_at_top_left,rgba(19,173,166,0.38),transparent_42%),radial-gradient(ellipse_at_top_right,rgba(0,87,94,0.8),transparent_48%),#042a2e]"><div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8"><div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div className="min-w-0"><div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.14)]" /> SECURE ADMINISTRATOR SESSION</div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/55">Jennefer Ann Art Gallery</p><h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">Gallery Command Centre</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-teal-50/70"><strong className="font-semibold text-white">Welcome back, Jennefer.</strong> Your private gallery performance board for collector growth, artwork attention, sales actions, and search readiness.</p></div><div className="flex flex-col gap-2 sm:flex-row"><Button asChild variant="outline" className="border-cyan-100/20 bg-cyan-50/5 text-teal-50 hover:bg-cyan-50/10 hover:text-white"><Link href="/"><Eye className="mr-2 h-4 w-4" />View gallery</Link></Button><Button asChild className="bg-cyan-300 text-[#063437] shadow-lg shadow-cyan-950/40 hover:bg-cyan-200"><Link href="/admin"><Palette className="mr-2 h-4 w-4" />Manage artwork</Link></Button></div></div><nav aria-label="Command Centre sections" className="mt-6 flex gap-2 overflow-x-auto border-t border-cyan-100/10 pt-4 text-xs font-semibold text-teal-50/65 [scrollbar-width:thin]"><a href="#executive-board" className="shrink-0 rounded-md bg-cyan-50/10 px-3 py-2 text-white">Executive board</a><a href="#operations" className="shrink-0 rounded-md px-3 py-2 hover:bg-cyan-50/10 hover:text-white">Operations</a><a href="#deep-analytics" className="shrink-0 rounded-md px-3 py-2 hover:bg-cyan-50/10 hover:text-white">Deep analytics</a><a href="#notifications" className="shrink-0 rounded-md px-3 py-2 hover:bg-cyan-50/10 hover:text-white">System notices</a></nav></div></section><main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8"><section id="executive-board" className="scroll-mt-24"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-cyan-200">Executive performance board</p><h2 className="mt-1 text-xl font-black text-white">The studio at a glance</h2></div><p className="rounded-full border border-cyan-100/15 bg-cyan-100/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-cyan-100">LIVE FIRST-PARTY DATA · LAST 30 DAYS</p></div><div className="grid gap-4 xl:grid-cols-[0.85fr_1.3fr_0.85fr]"><ExecutivePanel eyebrow="Monthly sales & views" title="Collector performance" icon={CircleDollarSign}><div className="grid grid-cols-2 gap-3"><div><p className="text-xs text-teal-50/60">Completed sales</p><p className="mt-1 text-3xl font-black text-white">{completedSales}</p><p className="mt-1 text-[11px] text-teal-50/55">{sales?.completedSalesZar ? `R${sales.completedSalesZar.toLocaleString()} recorded ZAR` : "No completed ZAR sales recorded"}</p></div><div><p className="text-xs text-teal-50/60">Page views</p><p className="mt-1 text-3xl font-black text-white">{totalViews.toLocaleString()}</p><p className="mt-1 text-[11px] text-teal-50/55">Real public views in this period</p></div></div><div className="mt-5 border-t border-cyan-100/10 pt-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-50/50">View activity</p><MiniBars values={dailyTraffic.map((entry: any) => entry.pageViews)} tint="bg-cyan-200" /></div></ExecutivePanel><Card className={`${PANEL} relative min-h-[280px] overflow-hidden rounded-2xl p-0`}><div className="absolute inset-0 bg-cover bg-center transition duration-500" style={spotlightImage ? { backgroundImage: `url(${spotlightImage})` } : { background: "linear-gradient(135deg,#0d7774,#08494e 58%,#042b32)" }} /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,35,39,0.96),rgba(2,35,39,0.53)_62%,rgba(2,35,39,0.28))]" /><div className="relative flex min-h-[280px] flex-col justify-between p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 bg-white/15 backdrop-blur"><UserRoundCheck className="h-5 w-5 text-cyan-100" /></div><div className="min-w-0"><p className="truncate text-sm font-black text-white">Jennefer Ann</p><p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.13em] text-cyan-100/75">Verified gallery administrator</p></div></div><span className="rounded-full border border-emerald-100/25 bg-emerald-300/15 px-2.5 py-1 text-[10px] font-bold text-emerald-100">ACTIVE</span></div><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-cyan-100/80">Jennefer’s studio spotlight</p><h2 className="mt-2 max-w-md text-2xl font-black tracking-tight text-white">Your artwork. Your command space.</h2><p className="mt-2 max-w-md text-xs leading-5 text-cyan-50/75">Choose any gallery artwork or upload a private image. It appears only here, behind the Administrator profile card.</p></div><div className="flex flex-col gap-2 sm:flex-row"><select aria-label="Choose artwork for Administrator spotlight" value={spotlightQuery.data?.spotlightArtworkId ? String(spotlightQuery.data.spotlightArtworkId) : ""} onChange={(event) => { if (event.target.value) selectSpotlightMutation.mutate({ artworkId: Number(event.target.value) }); }} className="h-9 min-w-0 flex-1 rounded-md border border-white/20 bg-[#063b3f]/80 px-3 text-xs text-white backdrop-blur"><option value="">Choose an artwork background</option>{(artworksQuery.data ?? []).map((artwork: any) => <option key={artwork.id} value={artwork.id}>{artwork.title}</option>)}</select><Button type="button" size="sm" className="bg-white/15 text-white hover:bg-white/25" onClick={() => fileInputRef.current?.click()} disabled={uploadSpotlightMutation.isPending}><ImagePlus className="mr-2 h-3.5 w-3.5" />{uploadSpotlightMutation.isPending ? "Uploading…" : "Upload image"}</Button><input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleSpotlightUpload} /></div></div></Card><ExecutivePanel eyebrow="Newsletter signups" title="Collector list growth" icon={MailCheck}><div className="flex items-end justify-between gap-3"><div><p className="text-4xl font-black tracking-tight text-white">{newsletters?.totalSubscribers ?? 0}</p><p className="mt-1 text-xs text-teal-50/65">consented collector subscribers</p></div><div className="rounded-lg border border-cyan-100/10 bg-black/10 px-3 py-2 text-right"><p className="text-[10px] uppercase tracking-wide text-teal-50/55">New 30 days</p><strong className="text-lg text-cyan-100">+{newsletters?.newSubscribers ?? 0}</strong></div></div><div className="mt-5 border-t border-cyan-100/10 pt-4"><div className="flex h-24 items-end gap-2">{monthlySignups.map((entry: any) => <div key={entry.key} className="flex h-full min-w-0 flex-1 flex-col justify-end"><div className="rounded-t-sm bg-emerald-300/85" style={{ height: `${Math.max(5, Math.round((entry.count / Math.max(...monthlySignups.map((item: any) => item.count), 1)) * 100))}%` }} /><span className="mt-1 text-center text-[9px] font-bold uppercase text-cyan-50/50">{entry.label}</span></div>)}</div></div></ExecutivePanel></div><div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr_0.8fr]"><ExecutivePanel eyebrow="Attention funnel" title="Where interest becomes action" icon={MousePointerClick}><p className="mb-4 text-xs leading-5 text-teal-50/65">Real progression through the gallery. Percentages use public page views as the starting point.</p><div className="space-y-3"><FunnelStep label="Public page views" value={totalViews} percent={100} accent="bg-cyan-300/65" /><FunnelStep label="Artwork detail views" value={artworkViews} percent={totalViews ? (artworkViews / totalViews) * 100 : 0} accent="bg-teal-300/65" /><FunnelStep label="High-intent actions" value={intentClicks} percent={totalViews ? (intentClicks / totalViews) * 100 : 0} accent="bg-emerald-300/65" /><FunnelStep label="Completed purchases" value={completedSales} percent={totalViews ? (completedSales / totalViews) * 100 : 0} accent="bg-amber-300/70" /></div></ExecutivePanel><ExecutivePanel eyebrow="Most attention" title="What collectors like" icon={Sparkles}><p className="mb-4 text-xs leading-5 text-teal-50/65">Popular public pages plus direct engagement signals from recorded sessions.</p><AttentionRows items={pageAttention.length ? pageAttention : eventAttention} /></ExecutivePanel><ExecutivePanel eyebrow="SEO & metrics" title="Search readiness" icon={SearchCheck}><div className="space-y-3">{[{ label: "Google Analytics tag", ready: seoReady.tag }, { label: "robots.txt", ready: seoReady.robots }, { label: "sitemap.xml", ready: seoReady.sitemap }].map((item) => <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-cyan-100/10 bg-black/10 px-3 py-3"><span className="text-xs text-teal-50/80">{item.label}</span><span className={`flex shrink-0 items-center gap-1 text-[10px] font-bold ${item.ready ? "text-emerald-200" : "text-amber-200"}`}><CheckCircle2 className="h-3.5 w-3.5" />{item.ready ? "READY" : "CHECKING"}</span></div>)}</div><Link href="/admin-dashboard?panel=seo#seo-dashboard" className="mt-5 inline-flex items-center text-xs font-bold text-cyan-100 hover:text-white">Open full SEO health <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link><p className="mt-3 text-[10px] leading-4 text-teal-50/45">Ad-spend reporting stays blank until a verified ad-platform integration is connected. This board does not invent marketing spend.</p></ExecutivePanel></div></section><section id="operations" className="mt-8 scroll-mt-24"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200">Operations</p><h2 className="mt-1 text-xl font-black text-white">Management workspace</h2></div><Link href="/admin" className="inline-flex items-center text-xs font-bold text-cyan-100 hover:text-white">Open management studio <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></div><div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">{[{ title: "Artwork studio", description: "Upload paintings and photography, update details, prices and availability.", icon: Palette }, { title: "Collector inbox", description: "Review enquiries, commissions, reservations and collector leads.", icon: Users }, { title: "Newsletter list", description: `${newsletters?.totalSubscribers ?? 0} consented collector subscriptions ready to manage.`, icon: MailCheck }, { title: "Catalogue control", description: "Organise collections, mark work sold, and curate featured pieces.", icon: Layers3 }].map((item) => <Link key={item.title} href="/admin" className="group"><Card className={`${PANEL} h-full rounded-xl p-4 transition hover:-translate-y-0.5 hover:border-cyan-100/35`}><item.icon className="h-5 w-5 text-cyan-200" /><h3 className="mt-4 text-sm font-bold text-white">{item.title}</h3><p className="mt-2 text-xs leading-5 text-teal-50/65">{item.description}</p><span className="mt-4 inline-flex items-center text-xs font-bold text-cyan-100">Open <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></span></Card></Link>)}</div></section><section id="deep-analytics" className="mt-8 scroll-mt-24"><AdminGrowthPanel /></section><div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]"><section><ExecutivePanel eyebrow="Marketing geography" title="Verified geographic reporting" icon={MapPinned}><p className="text-xs leading-5 text-teal-50/70">Country and city points remain available through the Geographic view inside Deep analytics once GA4 Data API access is authorised. The first-party tracker does not infer locations from visitors.</p></ExecutivePanel></section><section id="notifications" className="scroll-mt-24"><Card className={`${PANEL} h-full rounded-xl p-4 sm:p-5`}><div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200">Security & system</p><h2 className="mt-1 text-xl font-black text-white">Operational notices</h2></div><ShieldCheck className="h-5 w-5 text-cyan-200" /></div><NotificationsPanel notifications={operationalNotifications} onMarkRead={(id) => markEventRead.mutate({ id })} onMarkAllRead={() => markAllEventsRead.mutate()} /></Card></section></div></main></div>;
}
