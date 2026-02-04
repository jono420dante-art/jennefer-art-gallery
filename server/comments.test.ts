import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';

describe('Public Comments Functions', () => {
  const testArtworkId = 1;

  beforeAll(async () => {
    // Ensure database is initialized
    await db.getDb();
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  it('should fetch public comments for artwork', async () => {
    const comments = await db.getPublicCommentsByArtwork(testArtworkId);
    expect(Array.isArray(comments)).toBe(true);
  });

  it('should fetch public reviews', async () => {
    const reviews = await db.getPublicReviews();
    expect(Array.isArray(reviews)).toBe(true);
  });

  it('should return only approved comments', async () => {
    const comments = await db.getPublicCommentsByArtwork(testArtworkId);
    // All returned comments should have isApproved = 1
    comments.forEach(comment => {
      expect(comment.isApproved).toBe(1);
    });
  });

  it('should return only approved reviews', async () => {
    const reviews = await db.getPublicReviews();
    // All returned reviews should have isApproved = 1
    reviews.forEach(review => {
      expect(review.isApproved).toBe(1);
    });
  });
});
