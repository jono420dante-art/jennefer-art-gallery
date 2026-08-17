import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
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
import { useAuth } from "@/_core/hooks/useAuth";
import { NotificationsPanel, type OperationalNotification } from "@/components/NotificationsPanel";
import { AdminGrowthPanel } from "@/components/AdminGrowthPanel";

type StatCardProps = {
  icon: typeof Image;
  label: string;
  value: number | string;
  detail: string;
  accent: string;
};

function StatCard({ icon: Icon, label, value, detail, accent }: StatCardProps) {
  return (
    <Card className="group relative h-full min-w-0 overflow-hidden border-border/70 bg-card/90 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="break-words text-xs font-bold leading-4 text-muted-foreground">{label}</p>
          <p className="mt-2 break-words text-3xl font-black tracking-tight text-foreground sm:text-4xl">{value}</p>
          <p className="mt-2 break-words text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accent} text-white shadow-lg sm:h-11 sm:w-11`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
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
    <Link href={href} className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
      <Card className="h-full min-w-0 border-border/70 bg-card p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
        </div>
        <h3 className="mt-5 break-words text-base font-bold text-foreground">{title}</h3>
        <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{description}</p>
      </Card>
    </Link>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const artworksQuery = trpc.artworks.list.useQuery();
  const collectionsQuery = trpc.collections.list.useQuery();
  const contactsQuery = trpc.contact.list.useQuery();
  const reviewsQuery = trpc.reviews.listAll.useQuery();
  const ordersQuery = trpc.orders.list.useQuery();
  const notificationEventsQuery = trpc.notifications.list.useQuery();
  const growthSummaryQuery = trpc.analytics.summary.useQuery({ days: 7 }, { refetchInterval: 30_000 });
  const utils = trpc.useUtils();
  const markEventRead = trpc.notifications.markRead.useMutation({ onSuccess: () => utils.notifications.list.invalidate() });
  const markAllEventsRead = trpc.notifications.markAllRead.useMutation({ onSuccess: () => utils.notifications.list.invalidate() });

  const isLoading = artworksQuery.isLoading || collectionsQuery.isLoading || contactsQuery.isLoading || reviewsQuery.isLoading || ordersQuery.isLoading;
  const collectionNames = useMemo(
    () => new Map((collectionsQuery.data ?? []).map((collection: any) => [collection.id, collection.name])),
    [collectionsQuery.data],
  );

  const stats = {
    totalArtworks: artworksQuery.data?.length ?? 0,
    totalCollections: collectionsQuery.data?.length ?? 0,
    totalReviews: reviewsQuery.data?.length ?? 0,
    totalContacts: contactsQuery.data?.length ?? 0,
  };
  const inventory = useMemo(() => {
    const artworks = artworksQuery.data ?? [];
    return {
      available: artworks.filter((artwork: any) => artwork.isAvailable === 1).length,
      sold: artworks.filter((artwork: any) => artwork.isAvailable === 0).length,
    };
  }, [artworksQuery.data]);
  const conversionRate = growthSummaryQuery.data?.uniqueSessions
    ? ((growthSummaryQuery.data.conversionClicks / growthSummaryQuery.data.uniqueSessions) * 100).toFixed(1)
    : "0.0";

  const operationalNotifications = useMemo<OperationalNotification[]>(() => {
    return (notificationEventsQuery.data ?? []).map((event: any) => ({
      id: event.id,
      title: event.title,
      body: event.body,
      type: event.type,
      timestamp: event.createdAt,
      isRead: event.isRead,
    }));
  }, [notificationEventsQuery.data]);
  const unreadAlerts = operationalNotifications.filter((event) => !event.isRead).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.15),_transparent_38%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.35))] pb-14">
      <section className="border-b border-border/70 bg-background/75 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="min-w-0 max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-primary">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.16)]" />
                SECURE ADMINISTRATOR SESSION
              </div>
              <h1 className="break-words text-3xl font-black tracking-tight text-foreground sm:text-5xl">Gallery Command Centre</h1>
              <p className="mt-3 max-w-xl break-words text-sm leading-6 text-muted-foreground sm:text-base">Welcome back, {user?.name || "Administrator"}. Manage the collection, collector activity, marketing performance, and SEO health from one protected control point.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <Button asChild variant="outline" className="w-full border-primary/30 bg-card/80 sm:w-auto"><Link href="/"><Eye className="mr-2 h-4 w-4" />View gallery</Link></Button>
              <Button asChild className="w-full shadow-lg shadow-primary/20 sm:w-auto"><Link href="/admin"><Palette className="mr-2 h-4 w-4" />Manage artwork</Link></Button>
            </div>
          </div>
          <div className="mt-7 flex gap-2 overflow-x-auto border-t border-border/60 pt-5 text-sm [scrollbar-width:thin]">
            <a href="#operations" className="shrink-0 rounded-full border border-transparent px-3 py-2 font-medium text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary">Operations</a>
            <a href="#growth-control" className="shrink-0 rounded-full border border-transparent px-3 py-2 font-medium text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary">Growth & analytics</a>
            <a href="#activity" className="shrink-0 rounded-full border border-transparent px-3 py-2 font-medium text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary">Collection activity</a>
            <a href="#notifications" className="shrink-0 rounded-full border border-transparent px-3 py-2 font-medium text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary">System notices</a>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section aria-label="Gallery overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          <StatCard icon={Image} label="Artworks" value={isLoading ? "—" : stats.totalArtworks} detail={`${inventory.available} available · ${inventory.sold} sold`} accent="bg-violet-600" />
          <StatCard icon={FolderKanban} label="Collections" value={isLoading ? "—" : stats.totalCollections} detail="Organised gallery categories" accent="bg-cyan-600" />
          <StatCard icon={MessageSquare} label="Reviews" value={isLoading ? "—" : stats.totalReviews} detail="Submissions to monitor" accent="bg-amber-500" />
          <StatCard icon={Users} label="Collector leads" value={isLoading ? "—" : stats.totalContacts} detail="Contact and commission enquiries" accent="bg-emerald-600" />
          <StatCard icon={BarChart3} label="7-day sessions" value={growthSummaryQuery.isLoading ? "—" : (growthSummaryQuery.data?.uniqueSessions ?? 0)} detail={`${growthSummaryQuery.data?.pageViews ?? 0} recorded page views`} accent="bg-blue-600" />
          <StatCard icon={ShieldCheck} label="Action signals" value={unreadAlerts} detail={`${conversionRate}% click-to-session rate`} accent="bg-rose-600" />
        </section>

        <section id="operations" className="mt-10 scroll-mt-24">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Operations</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">Your primary workspace</h2>
            </div>
            <Link href="/admin" className="inline-flex w-fit items-center whitespace-nowrap text-sm font-semibold text-primary transition-colors hover:text-primary/80">Open full management studio <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <CommandCard title="Artwork studio" description="Upload work, update stories, pricing, availability and featured placement." href="/admin" icon={Palette} tone="bg-violet-500/15 text-violet-700 dark:text-violet-300" />
            <CommandCard title="Collection control" description="Move work between collections and keep the public gallery organised." href="/admin" icon={FolderKanban} tone="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" />
            <CommandCard title="Collector inbox" description="Review contact, commission, reservation and artwork enquiry leads." href="/admin" icon={ClipboardList} tone="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" />
            <CommandCard title="Review moderation" description="Moderate submissions and maintain the public-facing conversation." href="/admin" icon={MessageSquare} tone="bg-amber-500/15 text-amber-700 dark:text-amber-300" />
          </div>
        </section>

        <section id="growth-control" className="mt-10 scroll-mt-24">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Growth intelligence</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">Traffic, conversions & SEO</h2>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300"><LineChart className="h-3.5 w-3.5" />LIVE FIRST-PARTY DATA</div>
          </div>
          <AdminGrowthPanel />
        </section>

        <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section id="activity" className="scroll-mt-24">
            <Card className="h-full border-border/70 bg-card p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Collection activity</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">Latest catalogue entries</h2>
                </div>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-6 divide-y divide-border/70">
                {(artworksQuery.data ?? []).slice(0, 5).map((artwork: any) => (
                  <div key={artwork.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{artwork.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{collectionNames.get(artwork.collectionId) ?? "Gallery collection"}</p>
                    </div>
                    {artwork.slug && <Button asChild variant="ghost" size="sm" className="shrink-0"><Link href={`/artwork/${artwork.slug}`}>View <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link></Button>}
                  </div>
                ))}
                {!artworksQuery.isLoading && (artworksQuery.data ?? []).length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No catalogue activity recorded yet.</p>}
                {artworksQuery.isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Loading collection activity…</p>}
              </div>
            </Card>
          </section>

          <section id="notifications" className="scroll-mt-24">
            <Card className="h-full border-primary/20 bg-gradient-to-br from-card to-primary/5 p-6 sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Security & system</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">Operational notices</h2>
                </div>
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <NotificationsPanel notifications={operationalNotifications} onMarkRead={(id) => markEventRead.mutate({ id })} onMarkAllRead={() => markAllEventsRead.mutate()} />
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
