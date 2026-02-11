import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";

export default function CollectionDetail() {
  const [, params] = useRoute("/gallery/:slug");
  const slug = params?.slug || "";

  const { data: collection, isLoading: collectionLoading } = trpc.collections.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const { data: artworks, isLoading: artworksLoading } = trpc.artworks.listByCollection.useQuery(
    { collectionId: collection?.id || 0 },
    { enabled: !!collection?.id }
  );

  const isLoading = collectionLoading || artworksLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="heading-font text-4xl gradient-text mb-4">Collection Not Found</h2>
          <Link href="/gallery">
            <Button variant="outline">
              <ArrowLeft className="mr-2" size={16} />
              Back to Gallery
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Collection Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="lens-flare" style={{ top: '20%', left: '20%' }} />
        
        <div className="container relative z-10">
          <Link href="/gallery">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2" size={16} />
              Back to Gallery
            </Button>
          </Link>

          <h1 className="heading-font text-6xl md:text-8xl gradient-text mb-6 atmospheric-glow">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-xl text-muted-foreground max-w-3xl">
              {collection.description}
            </p>
          )}
        </div>
      </section>

      {/* Artworks Grid */}
      <section className="container py-12">
        {artworks && artworks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.map((artwork) => (
              <Link key={artwork.id} href={`/artwork/${artwork.slug}`}>
                <Card className="card-hover overflow-hidden bg-card border-border">
                  <div className="image-overlay aspect-square">
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="heading-font text-2xl text-foreground mb-2">
                      {artwork.title}
                    </h3>
                    {artwork.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {artwork.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      {artwork.priceZar && (
                        <div className="space-y-1">
                          <span className="text-primary font-semibold block">
                            R {artwork.priceZar}
                          </span>
                          {artwork.priceUsd && (
                            <span className="text-xs text-muted-foreground">
                              ${artwork.priceUsd} USD
                            </span>
                          )}
                        </div>
                      )}
                      <Button variant="ghost" size="sm" className="group">
                        View
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No artworks in this collection yet. Check back soon!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
