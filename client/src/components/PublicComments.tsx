import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Comment {
  id: number;
  name: string;
  comment: string;
  rating?: number;
  createdAt: string | Date;
  isReview?: boolean;
}

export function PublicComments({ artworkId, isReviewSection = false }: { artworkId?: number; isReviewSection?: boolean }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch public comments for specific artwork
  const { data: artworkComments, isLoading: commentsLoading } = trpc.comments.getPublicComments.useQuery(
    { artworkId: artworkId || 0 },
    { enabled: !!artworkId && !isReviewSection }
  );

  // Fetch public reviews
  const { data: publicReviews, isLoading: reviewsLoading } = trpc.comments.getPublicReviews.useQuery(
    undefined,
    { enabled: isReviewSection }
  );

  useEffect(() => {
    if (isReviewSection) {
      setLoading(reviewsLoading);
      if (publicReviews) {
        setComments(publicReviews.map((r: any) => ({
          ...r,
          isReview: true
        })));
      }
    } else if (artworkId) {
      setLoading(commentsLoading);
      if (artworkComments) {
        setComments(artworkComments);
      }
    } else {
      setLoading(false);
    }
  }, [artworkComments, publicReviews, commentsLoading, reviewsLoading, artworkId, isReviewSection]);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading comments...</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isReviewSection ? 'No reviews yet. Be the first to share your experience!' : 'No comments yet.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-sm">{comment.name}</h4>
              {comment.isReview && comment.rating && (
                <div className="flex gap-1 my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < comment.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm mt-2 text-foreground">{comment.comment}</p>
        </Card>
      ))}
    </div>
  );
}
