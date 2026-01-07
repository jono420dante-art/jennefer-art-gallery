import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Loader2, FolderOpen } from "lucide-react";

export default function Gallery() {
  const { data: collections, isLoading } = trpc.collections.list.useQuery();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="lens-flare" style={{ top: '20%', right: '30%' }} />
        
        <div className="container relative z-10">
          <h1 className="heading-font text-6xl md:text-8xl gradient-text text-center mb-6 atmospheric-glow">
            GALLERY
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
            Explore artworks organized into curated collections
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="container py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : collections && collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <Link key={collection.id} href={`/gallery/${collection.slug}`}>
                <Card className="card-hover p-10 bg-card border-border group">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-6 p-6 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <FolderOpen className="text-primary" size={48} />
                    </div>
                    <h2 className="heading-font text-4xl gradient-text mb-3">
                      {collection.name}
                    </h2>
                    {collection.description && (
                      <p className="text-muted-foreground">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No collections available yet. Please check back soon!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
