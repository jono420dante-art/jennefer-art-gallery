import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRoute } from "wouter";
import { Loader2, ArrowLeft, ShoppingCart, Share2, Heart, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PublicComments } from "@/components/PublicComments";

export default function ArtworkDetail() {
  const [, params] = useRoute("/artwork/:slug");
  const slug = params?.slug || "";

  const { data: artwork, isLoading } = trpc.artworks.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Note: We keep this query for admin purposes, but public display uses PublicComments component
  const { data: comments } = trpc.comments.listByArtwork.useQuery(
    { artworkId: artwork?.id || 0 },
    { enabled: !!artwork?.id }
  );

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      toast.success("Comment submitted! It will appear after approval.");
      setCommentForm({ name: "", email: "", comment: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit comment");
    },
  });

  const [commentForm, setCommentForm] = useState({
    name: "",
    email: "",
    comment: "",
  });

  // Dynamic page title and meta for SEO
  useEffect(() => {
    if (artwork) {
      document.title = `${artwork.title} - Jennefer Ann Art Gallery`;
      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 
          artwork.description 
            ? `${artwork.title} by Jennefer Ann. ${artwork.description.substring(0, 100)}` 
            : `${artwork.title} - Original realist oil painting by Jennefer Ann. View details and purchase.`
        );
      }
      // Update OG tags
      updateMetaTag('og:title', `${artwork.title} - Jennefer Ann Art Gallery`);
      updateMetaTag('og:description', artwork.description || `Original realist oil painting by Jennefer Ann`);
      updateMetaTag('og:image', artwork.imageUrl);
      updateMetaTag('og:url', window.location.href);
      updateMetaTag('og:type', 'product');
      // Twitter
      updateMetaTag('twitter:title', `${artwork.title} - Jennefer Ann Art Gallery`);
      updateMetaTag('twitter:description', artwork.description || `Original realist oil painting by Jennefer Ann`);
      updateMetaTag('twitter:image', artwork.imageUrl);
    }
    return () => {
      document.title = 'Jennefer Ann Art Gallery - Realist Oil Paintings';
    };
  }, [artwork]);

  const updateMetaTag = (property: string, content: string) => {
    let tag = document.querySelector(`meta[property="${property}"]`) || 
              document.querySelector(`meta[name="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      if (property.startsWith('og:')) {
        tag.setAttribute('property', property);
      } else {
        tag.setAttribute('name', property);
      }
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artwork) return;

    createComment.mutate({
      artworkId: artwork.id,
      ...commentForm,
    });
  };

  // Social sharing functions
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareOnTwitter = () => {
    const text = `Check out "${artwork?.title}" by Jennefer Ann - stunning realist oil painting!`;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareOnPinterest = () => {
    window.open(
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(artwork?.imageUrl || '')}&description=${encodeURIComponent(`${artwork?.title} - Original realist oil painting by Jennefer Ann`)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareOnWhatsApp = () => {
    const text = `Check out this beautiful painting "${artwork?.title}" by Jennefer Ann: ${shareUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="heading-font text-4xl gradient-text mb-4">Artwork Not Found</h2>
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
      {/* Structured Data for this artwork */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VisualArtwork",
            "name": artwork.title,
            "description": artwork.description || `Original realist oil painting by Jennefer Ann`,
            "image": artwork.imageUrl,
            "artist": {
              "@type": "Person",
              "name": "Jennefer Ann"
            },
            "artMedium": artwork.medium || "Oil on canvas",
            "width": artwork.dimensions,
            ...(artwork.isAvailable && artwork.priceZar && {
              "offers": {
                "@type": "Offer",
                "price": artwork.priceZar,
                "priceCurrency": "ZAR",
                "availability": "https://schema.org/InStock",
                "seller": {
                  "@type": "Organization",
                  "name": "Jennefer Ann Art Gallery"
                }
              }
            }),
            ...(!artwork.isAvailable && {
              "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/SoldOut"
              }
            })
          })
        }}
      />

      <section className="container py-12">
        <Link href="/gallery">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2" size={16} />
            Back to Gallery
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Artwork Image */}
          <div className="atmospheric-glow">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full rounded-lg shadow-2xl"
            />
          </div>

          {/* Artwork Details */}
          <div>
            <h1 className="heading-font text-5xl gradient-text mb-4">
              {artwork.title}
            </h1>

            {artwork.description && (
              <p className="text-lg text-muted-foreground mb-6">
                {artwork.description}
              </p>
            )}

            <div className="space-y-4 mb-8">
              {artwork.dimensions && (
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-foreground w-32">Dimensions:</span>
                  <span className="text-sm text-muted-foreground">{artwork.dimensions}</span>
                </div>
              )}

              {artwork.medium && (
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-foreground w-32">Medium:</span>
                  <span className="text-sm text-muted-foreground">{artwork.medium}</span>
                </div>
              )}

              {artwork.priceZar && (
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-foreground w-32">Price:</span>
                  <div className="space-y-1">
                    <span className="text-xl font-bold text-primary block">
                      R {artwork.priceZar} ZAR
                    </span>
                    {artwork.priceUsd && (
                      <span className="text-sm text-muted-foreground">
                        ${artwork.priceUsd} USD
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <span className="text-sm font-semibold text-foreground w-32">Availability:</span>
                <span className={`text-sm font-bold ${artwork.isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                  {artwork.isAvailable ? 'Available' : 'Sold'}
                </span>
              </div>
            </div>

            {artwork.isAvailable && (
              <div className="space-y-4 mb-8">
                {artwork.collectionId === 6 ? (
                  <>
                    <Link href={`/checkout/${artwork.slug}`}>
                      <Button size="lg" className="w-full group">
                        <ShoppingCart className="mr-2" size={20} />
                        Buy Now
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button size="lg" variant="outline" className="w-full group">
                        <ShoppingCart className="mr-2" size={20} />
                        Inquire or Commission
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/contact">
                    <Button size="lg" className="w-full group">
                      <ShoppingCart className="mr-2" size={20} />
                      Inquire or Commission
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Social Sharing Buttons */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Share2 size={14} /> Share this artwork
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={shareOnFacebook}
                  className="text-xs hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={shareOnTwitter}
                  className="text-xs hover:bg-sky-500/10 hover:border-sky-500/30 hover:text-sky-400"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X / Twitter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={shareOnPinterest}
                  className="text-xs hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>
                  Pinterest
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={shareOnWhatsApp}
                  className="text-xs hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyLink}
                  className="text-xs hover:bg-primary/10 hover:border-primary/30"
                >
                  <ExternalLink size={14} className="mr-1" />
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-20">
          <h2 className="heading-font text-4xl gradient-text mb-8">Comments & Feedback</h2>

          {/* Comment Form */}
          <Card className="p-6 bg-card border-border mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Leave a Comment</h3>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Your Name *"
                  value={commentForm.name}
                  onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                  required
                  className="bg-background"
                />
                <Input
                  type="email"
                  placeholder="Your Email (optional)"
                  value={commentForm.email}
                  onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                  className="bg-background"
                />
              </div>
              <Textarea
                placeholder="Your comment *"
                value={commentForm.comment}
                onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                required
                rows={4}
                className="bg-background"
              />
              <Button type="submit" disabled={createComment.isPending}>
                {createComment.isPending ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={16} />
                    Submitting...
                  </>
                ) : (
                  "Submit Comment"
                )}
              </Button>
            </form>
          </Card>

          {/* Public Comments List */}
          <h3 className="text-2xl font-semibold text-foreground mb-6">Approved Comments</h3>
          <PublicComments artworkId={artwork.id} />
        </div>
      </section>
    </div>
  );
}
