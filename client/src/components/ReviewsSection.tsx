import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import StarRating from './StarRating';
import { toast } from 'sonner';
import { MessageSquare, Send } from 'lucide-react';

export default function ReviewsSection() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: reviews = [], refetch } = trpc.reviews.list.useQuery();
  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success('Thank you for your review! It will be visible after approval.');
      setName('');
      setEmail('');
      setRating(5);
      setComment('');
      setShowForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit review');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    createReview.mutate({
      name: name.trim(),
      email: email.trim() || undefined,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <div className="py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="heading-font text-4xl gradient-text mb-4">
            What Collectors Say
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <StarRating rating={Math.round(Number(averageRating))} readonly size="lg" />
            <span className="text-2xl font-bold text-foreground">{averageRating}</span>
          </div>
          <p className="text-muted-foreground">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} from art collectors
          </p>
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6 border-border bg-card/50 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{review.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground italic">
                    "{review.comment}"
                  </p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-12">
            <MessageSquare size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}

        {/* Add Review Button / Form */}
        <div className="max-w-xl mx-auto">
          {!showForm ? (
            <div className="text-center">
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="bg-accent hover:bg-accent/90"
              >
                <MessageSquare size={18} className="mr-2" />
                Leave a Review
              </Button>
            </div>
          ) : (
            <Card className="p-6 border-border bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Share Your Experience</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Your Rating *</label>
                  <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Your Name *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-muted border-border"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Email (optional)</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="bg-muted border-border"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Your Review (optional)</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with Jennefer's artwork..."
                    className="bg-muted border-border min-h-24"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={createReview.isPending}
                    className="flex-1"
                  >
                    <Send size={16} className="mr-2" />
                    {createReview.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
