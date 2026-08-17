import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  ClipboardList,
  Eye,
  FolderKanban,
  Image,
  LineChart,
  MessageSquare,
  Palette,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { NotificationsPanel, type OperationalNotification } from "@/components/NotificationsPanel";
import { AdminGrowthPanel } from "@/components/AdminGrowthPanel";

type StatCardProps = {
  icon: typeof Image;
  label: string;
  value: number | string;
  detail: string;
  accent: "violet" | "blue" | "emerald" | "amber" | "rose" | "cyan";
};

const accentStyles: Record<StatCardProps["accent"], { icon: string; dot: string; bars: string }> = {
  violet: { icon: "bg-violet-500/15 text-violet-300", dot: "bg-violet-400", bars: "bg-violet-400/75" },
  blue: { icon: "bg-blue-500/15 text-blue-300", dot: "bg-blue-400", bars: "bg-blue-400/75" },
  emerald: { icon: "bg-emerald-500/15 text-emerald-300", dot: "bg-emerald-400", bars: "bg-emerald-400/75" },
  amber: { icon: "bg-amber-500/15 text-amber-300", dot: "bg-amber-400", bars: "bg-amber-400/75" },
  rose: { icon: "bg-rose-500/15 text-rose-300", dot: "bg-rose-400", bars: "bg-rose-400/75" },
  cyan: { icon: "bg-cyan-500/15 text-cyan-300", dot: "bg-cyan-400", bars: "bg-cyan-400/75" },
};

function MetricPulse({ bars, className }: { bars: number[]; className: string }) {
  const max = Math.max(...bars, 0);
  if (max === 0) return <span className="text-[10px] font-medium text-slate-500">Awaiting recorded activity</span>;
  return (
    <div className="flex h-8 items-end gap-1" aria-hidden="true">
      {bars.map((bar, index) => (
        <span
          key={index}
          className={`w-1.5 rounded-t-sm ${className}`}
          style={{ height: `${Math.max(16, Math.round((bar / max) * 100))}%` }}
        />
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, accent }: StatCardProps) {
  const styles = accentStyles[accent];
  return (
    <Card className="group min-w-0 overflow-hidden rounded-xl border border-white/8 bg-[#15171c] p-4 shadow-[0_18px_35px_-28px_rgba(0,0,0,0.9)] transition duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-[#191c22] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            <p className="break-words text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
          </div>
          <p className="mt-3 break-words text-3xl font-black tracking-tight text-white sm:text-4xl">{value}</p>
          <p className="mt-2 min-h-8 break-words text-xs leading-4 text-slate-400">{detail}</p>
        </div>
        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${styles.icon}`}><Icon className="h-4 w-4" /></div>
      </div>
      <div className="mt-3 border-t border-white/6 pt-3"><MetricPulse bars={[2, 4, 3, 6, 4, 7, 5]} className={styles.bars} /></div>
    </Card>
  );
}

type CommandCardProps = {
  title: string;
  description: string;
  href: string;
  icon: typeof Palette;
  tone: string;
};

function CommandCard({ title, description, href, icon: Icon, tone }: CommandCardProps) {
  return (
    <Link href={href} className="group block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
      <Card className="h-full min-w-0 rounded-xl border border-white/8 bg-[#15171c] p-4 transition duration-200 hover:border-violet-400/35 hover:bg-[#191c22] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></div>
          <ArrowUpRight className="h-4 w-4 text-slate-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-300" />
        </div>
        <h3 className="mt-5 break-words text-sm font-bold text-slate-100">{title}</h3>
        <p className="mt-2 break-words text-xs leading-5 text-slate-400">{description}</p>
      </Card>
    </Link>
  );
}

function TrafficPulseChart({ dailyTraffic }: { dailyTraffic: Array<{ date: string; sessions: number; pageViews: number; conversionClicks: number }> }) {
  const maxSessions = Math.max(...dailyTraffic.map((entry) => entry.sessions), 0);
  const totalSessions = dailyTraffic.reduce((total, entry) => total + entry.sessions, 0);
  const totalViews = dailyTraffic.reduce((total, entry) => total + entry.pageViews, 0);

  return (
    <Card className="min-w-0 overflow-hidden rounded-xl border border-white/8 bg-[#15171c] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><LineChart className="h-4 w-4 text-violet-300" /><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Visitor activity</p></div>
          <h2 className="mt-2 text-lg font-black tracking-tight text-white">Seven-day traffic pulse</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">Sessions and page views captured by the gallery&apos;s first-party tracker.</p>
        </div>
        <div className="flex gap-4 text-xs sm:text-right">
          <div><p className="font-black text-white">{totalSessions}</p><p className="text-slate-500">sessions</p></div>
          <div><p className="font-black text-white">{totalViews}</p><p className="text-slate-500">views</p></div>
        </div>
      </div>
      {maxSessions > 0 ? (
        <div className="mt-6">
          <div className="flex h-36 items-end gap-2 border-b border-white/10 pb-1 sm:h-40 sm:gap-3">
            {dailyTraffic.map((entry) => (
              <div key={entry.date} className="group relative flex h-full min-w-0 flex-1 items-end justify-center">
                <div className="absolute bottom-full z-10 mb-2 hidden w-32 rounded-md border border-white/10 bg-[#252831] px-2 py-1.5 text-center text-[10px] text-slate-200 shadow-xl group-hover:block">
                  {entry.sessions} sessions · {entry.pageViews} views · {entry.conversionClicks} conversion clicks
                </div>
                <div className="w-full max-w-8 rounded-t-md bg-gradient-to-t from-violet-600 to-blue-400 transition-opacity group-hover:opacity-80" style={{ height: `${Math.max(6, (entry.sessions / maxSessions) * 100)}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2 text-center text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            {dailyTraffic.map((entry) => <span key={entry.date}>{new Date(`${entry.date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: "short" })}</span>)}
          </div>
        </div>
      ) : <p className="mt-8 rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-5 text-center text-sm text-slate-400">No visits have been recorded in the last seven days. The chart will populate from real public sessions.</p>}
    </Card>
  );
}

export default function AdminDashboard() {
  const artworksQuery = trpc.artworks.list.useQuery();
  const collectionsQuery = trpc.collections.list.useQuery();
  const contactsQuery = trpc.contact.list.useQuery();
  const reviewsQuery = trpc.reviews.listAll.useQuery();
  const notificationEventsQuery = trpc.notifications.list.useQuery();
  const growthSummaryQuery = trpc.analytics.summary.useQuery({ days: 7 }, { refetchInterval: 30_000 });
  const utils = trpc.useUtils();
  const markEventRead = trpc.notifications.markRead.useMutation({ onSuccess: () => utils.notifications.list.invalidate() });
  const markAllEventsRead = trpc.notifications.markAllRead.useMutation({ onSuccess: () => utils.notifications.list.invalidate() });

  const isLoading = artworksQuery.isLoading || collectionsQuery.isLoading || contactsQuery.isLoading || reviewsQuery.isLoading;
  const collectionNames = useMemo(() => new Map((collectionsQuery.data ?? []).map((collection: any) => [collection.id, collection.name])), [collectionsQuery.data]);
  const inventory = useMemo(() => {
    const artworks = artworksQuery.data ?? [];
    return { available: artworks.filter((artwork: any) => artwork.isAvailable === 1).length, sold: artworks.filter((artwork: any) => artwork.isAvailable === 0).length };
  }, [artworksQuery.data]);
  const operationalNotifications = useMemo<OperationalNotification[]>(() => (notificationEventsQuery.data ?? []).map((event: any) => ({ id: event.id, title: event.title, body: event.body, type: event.type, timestamp: event.createdAt, isRead: event.isRead })), [notificationEventsQuery.data]);
  const unreadAlerts = operationalNotifications.filter((event) => !event.isRead).length;
  const conversionRate = growthSummaryQuery.data?.uniqueSessions ? ((growthSummaryQuery.data.conversionClicks / growthSummaryQuery.data.uniqueSessions) * 100).toFixed(1) : "0.0";
  const dailyTraffic = growthSummaryQuery.data?.dailyTraffic ?? [];

  return (
    <div className="min-h-screen bg-[#090b10] pb-14 text-slate-100 selection:bg-violet-500/40">
      <section className="border-b border-white/8 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.22),transparent_36%),linear-gradient(180deg,#12141a_0%,#0c0e13_100%)]">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" /> SECURE ADMINISTRATOR SESSION</div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Jennefer Ann Art Gallery</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">Gallery Command Centre</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400"><strong className="font-semibold text-slate-200">Welcome back, Jennefer.</strong> Your protected gallery cockpit for the catalogue, collector interest, first-party traffic and search readiness.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild variant="outline" className="border-white/15 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08] hover:text-white"><Link href="/"><Eye className="mr-2 h-4 w-4" />View gallery</Link></Button>
              <Button asChild className="bg-violet-600 text-white shadow-lg shadow-violet-950/60 hover:bg-violet-500"><Link href="/admin"><Palette className="mr-2 h-4 w-4" />Manage artwork</Link></Button>
            </div>
          </div>
          <nav aria-label="Command Centre sections" className="mt-6 flex gap-2 overflow-x-auto border-t border-white/8 pt-4 text-xs font-semibold text-slate-400 [scrollbar-width:thin]">
            <a href="#overview" className="shrink-0 rounded-md bg-white/[0.07] px-3 py-2 text-slate-100">Overview</a>
            <a href="#operations" className="shrink-0 rounded-md px-3 py-2 hover:bg-white/[0.06] hover:text-white">Operations</a>
            <a href="#growth-control" className="shrink-0 rounded-md px-3 py-2 hover:bg-white/[0.06] hover:text-white">Growth intelligence</a>
            <a href="#activity" className="shrink-0 rounded-md px-3 py-2 hover:bg-white/[0.06] hover:text-white">Catalogue activity</a>
            <a href="#notifications" className="shrink-0 rounded-md px-3 py-2 hover:bg-white/[0.06] hover:text-white">System notices</a>
          </nav>
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <section id="overview" aria-label="Gallery executive overview" className="scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">Executive overview</p><h2 className="mt-1 text-xl font-black text-white">Live gallery performance</h2></div><p className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-emerald-300">LIVE FIRST-PARTY DATA</p></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <StatCard icon={Image} label="Artworks" value={isLoading ? "—" : artworksQuery.data?.length ?? 0} detail={`${inventory.available} available · ${inventory.sold} sold`} accent="violet" />
            <StatCard icon={FolderKanban} label="Collections" value={isLoading ? "—" : collectionsQuery.data?.length ?? 0} detail="Organised public categories" accent="cyan" />
            <StatCard icon={MessageSquare} label="Reviews" value={isLoading ? "—" : reviewsQuery.data?.length ?? 0} detail="Submissions awaiting attention" accent="amber" />
            <StatCard icon={Users} label="Collector leads" value={isLoading ? "—" : contactsQuery.data?.length ?? 0} detail="Contact and commission enquiries" accent="emerald" />
            <StatCard icon={LineChart} label="Seven-day sessions" value={growthSummaryQuery.isLoading ? "—" : growthSummaryQuery.data?.uniqueSessions ?? 0} detail={`${growthSummaryQuery.data?.pageViews ?? 0} recorded page views`} accent="blue" />
            <StatCard icon={BellRing} label="Action signals" value={unreadAlerts} detail={`${conversionRate}% recorded click-to-session rate`} accent="rose" />
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <TrafficPulseChart dailyTraffic={dailyTraffic} />
            <Card className="rounded-xl border border-white/8 bg-[#15171c] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Catalogue signal</p><h2 className="mt-2 text-lg font-black text-white">Availability snapshot</h2></div><Sparkles className="h-5 w-5 text-amber-300" /></div>
              <div className="mt-6 space-y-5">
                <div><div className="mb-2 flex justify-between gap-3 text-xs"><span className="text-slate-400">Available pieces</span><strong className="text-emerald-300">{inventory.available}</strong></div><div className="h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${(inventory.available + inventory.sold) ? (inventory.available / (inventory.available + inventory.sold)) * 100 : 0}%` }} /></div></div>
                <div><div className="mb-2 flex justify-between gap-3 text-xs"><span className="text-slate-400">Sold pieces</span><strong className="text-rose-300">{inventory.sold}</strong></div><div className="h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-rose-400" style={{ width: `${(inventory.available + inventory.sold) ? (inventory.sold / (inventory.available + inventory.sold)) * 100 : 0}%` }} /></div></div>
              </div>
              <p className="mt-6 border-t border-white/8 pt-4 text-xs leading-5 text-slate-500">These bars reflect the live catalogue status stored in the protected artwork manager.</p>
            </Card>
          </div>
        </section>

        <section id="operations" className="mt-8 scroll-mt-24">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">Operations</p><h2 className="mt-1 text-xl font-black text-white">Management workspace</h2></div><Link href="/admin" className="inline-flex w-fit items-center text-xs font-bold text-violet-300 hover:text-violet-200">Open management studio <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <CommandCard title="Artwork studio" description="Upload work, update stories, prices, availability and featured placement." href="/admin" icon={Palette} tone="bg-violet-500/15 text-violet-300" />
            <CommandCard title="Collection control" description="Move work between collections and keep public folders organised." href="/admin" icon={FolderKanban} tone="bg-cyan-500/15 text-cyan-300" />
            <CommandCard title="Collector inbox" description="Review contact, commission, reservation and artwork enquiries." href="/admin" icon={ClipboardList} tone="bg-emerald-500/15 text-emerald-300" />
            <CommandCard title="Review moderation" description="Moderate submissions and maintain public-facing trust." href="/admin" icon={MessageSquare} tone="bg-amber-500/15 text-amber-300" />
          </div>
        </section>

        <section id="growth-control" className="mt-8 scroll-mt-24"><AdminGrowthPanel /></section>

        <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <section id="activity" className="scroll-mt-24"><Card className="h-full rounded-xl border border-white/8 bg-[#15171c] p-4 sm:p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">Collection activity</p><h2 className="mt-1 text-xl font-black text-white">Latest catalogue entries</h2></div><Sparkles className="h-5 w-5 text-violet-300" /></div><div className="mt-5 divide-y divide-white/8">{(artworksQuery.data ?? []).slice(0, 5).map((artwork: any) => <div key={artwork.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-100">{artwork.title}</p><p className="mt-1 truncate text-xs text-slate-500">{collectionNames.get(artwork.collectionId) ?? "Gallery collection"}</p></div>{artwork.slug && <Button asChild variant="ghost" size="sm" className="shrink-0 text-slate-300 hover:bg-white/[0.06] hover:text-white"><Link href={`/artwork/${artwork.slug}`}>View <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link></Button>}</div>)}{!artworksQuery.isLoading && (artworksQuery.data ?? []).length === 0 && <p className="py-8 text-center text-sm text-slate-400">No catalogue activity recorded yet.</p>}{artworksQuery.isLoading && <p className="py-8 text-center text-sm text-slate-400">Loading collection activity…</p>}</div></Card></section>
          <section id="notifications" className="scroll-mt-24"><Card className="h-full rounded-xl border border-violet-400/20 bg-[linear-gradient(135deg,#171821_0%,#15171c_65%,rgba(124,58,237,0.14)_100%)] p-4 sm:p-5"><div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">Security & system</p><h2 className="mt-1 text-xl font-black text-white">Operational notices</h2></div><ShieldCheck className="h-5 w-5 text-violet-300" /></div><NotificationsPanel notifications={operationalNotifications} onMarkRead={(id) => markEventRead.mutate({ id })} onMarkAllRead={() => markAllEventsRead.mutate()} /></Card></section>
        </div>
      </main>
    </div>
  );
}
