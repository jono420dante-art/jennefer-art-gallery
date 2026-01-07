import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRoute } from "wouter";
import { Loader2, ArrowLeft, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ArtworkDetail() {
  const [, params] = useRoute("/artwork/:slug");
  const slug = params?.slug || "";

  const { data: artwork, isLoading } = trpc.artworks.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

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

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artwork) return;

    createComment.mutate({
      artworkId: artwork.id,
      ...commentForm,
    });
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

              {artwork.priceZAR && (
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-foreground w-32">Price:</span>
                  <div className="space-y-1">
                    <span className="text-xl font-bold text-primary block">
                      R {artwork.priceZAR} ZAR
                    </span>
                    {artwork.priceUSD && (
                      <span className="text-sm text-muted-foreground">
                        ${artwork.priceUSD} USD
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <span className="text-sm font-semibold text-foreground w-32">Availability:</span>
                <span className={`text-sm ${artwork.isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                  {artwork.isAvailable ? 'Available' : 'Sold'}
                </span>
              </div>
            </div>

            {artwork.isAvailable && (
              <div className="space-y-4">
                <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" className="w-full">
                  <input type="hidden" name="cmd" value="_xclick" />
                  <input type="hidden" name="business" value="jenneferann@paypal.com" />
                  <input type="hidden" name="item_name" value={artwork.title} />
                  <input type="hidden" name="item_number" value={artwork.id.toString()} />
                  <input type="hidden" name="amount" value={String(artwork.priceUSD || artwork.priceZAR || 0)} />
                  <input type="hidden" name="currency_code" value={artwork.priceUSD ? "USD" : "ZAR"} />
                  <input type="hidden" name="return" value={typeof window !== 'undefined' ? `${window.location.origin}/gallery` : ''} />
                  <input type="hidden" name="cancel_return" value={typeof window !== 'undefined' ? window.location.href : ''} />
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center mb-3">
                    <ShoppingCart className="mr-2" size={20} />
                    Buy Now with PayPal
                  </button>
                </form>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full group">
                    <ShoppingCart className="mr-2" size={20} />
                    Inquire or Commission
                  </Button>
                </Link>
              </div>
            )}
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

          {/* Comments List */}
          {comments && comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <Card key={comment.id} className="p-6 bg-card border-border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{comment.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{comment.comment}</p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
