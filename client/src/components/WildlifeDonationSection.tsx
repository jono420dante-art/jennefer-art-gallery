import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function WildlifeDonationSection() {
  const { data: artworks, isLoading } = trpc.artworks.listByCollection.useQuery(
    { collectionId: 90004 }, // Wildlife collection
    { enabled: true }
  );

  if (isLoading) {
    return (
      <section className="container py-20">
        <div className="section-divider" />
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </section>
    );
  }

  // Find the cheetah donation artwork
  const donationArtwork = artworks?.find(
    (art: any) => art.title.toLowerCase().includes("cheetah")
  );

  if (!donationArtwork) {
    return null;
  }

  return (
    <section className="container py-20">
      <div className="section-divider" />
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="text-red-500 fill-red-500" size={24} />
          <h2 className="heading-font text-5xl gradient-text">WILDLIFE DONATION</h2>
          <Heart className="text-red-500 fill-red-500" size={24} />
        </div>
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-6" />
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
          Supporting wildlife conservation through art
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden bg-card border-border">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={donationArtwork.imageUrl}
              alt={donationArtwork.title}
              className="w-full h-full object-cover"
            />
            
            {/* Donation Badge Overlay */}
            <div className="absolute top-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-full font-semibold text-sm">
              Donated for Conservation
            </div>
          </div>

          {/* Donation Info */}
          <div className="p-8 bg-card">
            <h3 className="heading-font text-3xl gradient-text mb-4">
              {donationArtwork.title}
            </h3>
            
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {donationArtwork.description}
            </p>

            <div className="bg-muted/50 p-6 rounded-lg border border-accent/30 mb-6">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Cango Wildlife Ranch</span> is dedicated to wildlife conservation and rehabilitation. 
                The recent devastating flood impacted their critical work. This artwork has been generously donated to help raise funds for their recovery and continued mission.
              </p>
            </div>

            <div className="flex gap-4">
              <Link href={`/artwork/${donationArtwork.slug}`}>
                <Button size="lg" className="group">
                  Learn More About This Piece
                </Button>
              </Link>
              <a href="https://cangoranch.com" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline">
                  Visit Cango Wildlife Ranch
                </Button>
              </a>
            </div>
          </div>
        </Card>

        {/* Impact Message */}
        <div className="mt-8 p-6 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/30">
          <p className="text-center text-sm text-muted-foreground">
            <span className="font-semibold text-foreground block mb-2">
              Your support makes a difference
            </span>
            Every purchase and commission helps us continue supporting wildlife conservation initiatives across Africa.
          </p>
        </div>
      </div>
    </section>
  );
}
