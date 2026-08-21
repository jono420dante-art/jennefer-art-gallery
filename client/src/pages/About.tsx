import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";

const defaultContent = `Jennefer Ann Gordon Grant is a South African-based professional artist, recognised for her realistic portrait, landscape, seascape, and wildlife paintings.

Her life and work are shaped by a deep love of art, the natural world, faith, and the distinctive light and wildlife of Africa. Jennefer works across oil, watercolour, acrylic, and pastel, with oils as her primary medium.

Through her art, Jennefer seeks to capture beauty, honour creation, stir the soul, and tell stories that connect people to nature and the living world around them.`;

export default function About() {
  const aboutQuery = trpc.about.get.useQuery();
  const title = aboutQuery.data?.title || "About the Artist";
  const content = aboutQuery.data?.content || defaultContent;
  return <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20"><main className="container py-20"><div className="mb-16 text-center"><h1 className="heading-font mb-4 text-6xl gradient-text">{title}</h1><div className="mx-auto h-1 w-24 bg-gradient-to-r from-transparent via-accent to-transparent" /></div>{aboutQuery.isLoading ? <p className="py-20 text-center text-muted-foreground">Loading…</p> : <div className="mx-auto max-w-4xl"><Card className="border-border bg-card/50 p-8 backdrop-blur-sm sm:p-12"><div className="prose prose-invert max-w-none">{content.split("\n\n").map((paragraph, index) => <p key={index} className="mb-6 text-lg leading-relaxed text-foreground last:mb-0">{paragraph}</p>)}</div></Card></div>}<div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3"><Card className="border-border bg-card/50 p-8 text-center backdrop-blur-sm"><div className="heading-font mb-2 text-3xl gradient-text">REALISM</div><p className="text-sm text-muted-foreground">Traditional techniques focused on accuracy and authenticity.</p></Card><Card className="border-border bg-card/50 p-8 text-center backdrop-blur-sm"><div className="heading-font mb-2 text-3xl gradient-text">AFRICA</div><p className="text-sm text-muted-foreground">Capturing distinct light, natural beauty, and living landscapes.</p></Card><Card className="border-border bg-card/50 p-8 text-center backdrop-blur-sm"><div className="heading-font mb-2 text-3xl gradient-text">WILDLIFE</div><p className="text-sm text-muted-foreground">Art that celebrates and supports the natural world.</p></Card></div></main></div>;
}
