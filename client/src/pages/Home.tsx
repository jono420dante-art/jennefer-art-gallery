import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Loader2, ArrowRight } from "lucide-react";

export default function Home() {
  const { data: featuredArtworks, isLoading } = trpc.artworks.featured.useQuery();
  const { data: collections } = trpc.collections.list.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section - Heavenly Italian Gallery */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden marble-texture">
        {/* Divine Light Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="lens-flare" style={{ top: '15%', right: '15%' }} />
          <div className="lens-flare" style={{ bottom: '20%', left: '10%', opacity: 0.5 }} />
          <div className="light-ray" style={{ left: '25%' }} />
          <div className="light-ray" style={{ right: '25%', animationDelay: '2s' }} />
        </div>

        <div className="container relative z-10 text-center">
          <h1 className="heading-font text-7xl md:text-9xl gradient-text mb-8 atmospheric-glow">
            JENNEFER ANN
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-8" />
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Realist oil paintings capturing the beauty of Africa's people, wildlife, and landscapes through faith and authentic observation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/gallery">
              <Button size="lg" className="group">
                View Gallery
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Commission Artwork
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="container py-20">
        <div className="section-divider" />
        <div className="text-center mb-16">
          <h2 className="heading-font text-5xl gradient-text mb-6">FEATURED WORKS</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            A curated selection of realist paintings celebrating Africa's beauty, wildlife, and spiritual essence
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : featuredArtworks && featuredArtworks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArtworks.map((artwork) => (
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
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {artwork.description}
                    </p>
                    <div className="flex justify-between items-center">
                      {artwork.priceZAR && (
                        <span className="text-primary font-semibold">
                          R {artwork.priceZAR}
                        </span>
                      )}
                      <Button variant="ghost" size="sm" className="group">
                        View Details
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
            <p className="text-muted-foreground">No featured artworks yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Collections Preview */}
      {collections && collections.length > 0 && (
        <section className="container py-20">
          <div className="section-divider" />
          <div className="text-center mb-16">
            <h2 className="heading-font text-5xl gradient-text mb-6">EXPLORE COLLECTIONS</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
              Discover artworks organized by theme and artistic vision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.slice(0, 6).map((collection) => (
              <Link key={collection.id} href={`/gallery/${collection.slug}`}>
                <Card className="card-hover p-8 bg-card border-border text-center">
                  <h3 className="heading-font text-3xl gradient-text mb-2">
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground">
                      {collection.description}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/gallery">
              <Button variant="outline" size="lg">
                View All Collections
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* About Preview */}
      <section className="container py-20">
        <div className="section-divider" />
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-font text-5xl gradient-text mb-6">ABOUT THE ARTIST</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-8" />
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-light">
            Jennefer Ann is a South African realist oil painter inspired by God's creation and the enduring beauty of Africa's people, wildlife, and landscapes. Her work captures subjects with meticulous attention to form, proportion, light, and texture, preserving the emotion and presence that make each subject unique.
          </p>
          <Link href="/about">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
