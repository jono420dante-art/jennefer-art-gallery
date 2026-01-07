import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ COLLECTION ROUTES ============
  collections: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCollections();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const collection = await db.getCollectionBySlug(input.slug);
        if (!collection) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Collection not found' });
        }
        return collection;
      }),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        displayOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        await db.createCollection(input);
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCollection(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCollection(input.id);
        return { success: true };
      }),
  }),

  // ============ ARTWORK ROUTES ============
  artworks: router({
    list: publicProcedure.query(async () => {
      return await db.getAllArtworks();
    }),

    listByCollection: publicProcedure
      .input(z.object({ collectionId: z.number() }))
      .query(async ({ input }) => {
        return await db.getArtworksByCollection(input.collectionId);
      }),

    featured: publicProcedure.query(async () => {
      return await db.getFeaturedArtworks();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const artwork = await db.getArtworkBySlug(input.slug);
        if (!artwork) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Artwork not found' });
        }
        return artwork;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const artwork = await db.getArtworkById(input.id);
        if (!artwork) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Artwork not found' });
        }
        return artwork;
      }),

    create: adminProcedure
      .input(z.object({
        collectionId: z.number(),
        title: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        imageBase64: z.string(),
        dimensions: z.string().optional(),
        medium: z.string().optional(),
        priceZAR: z.string().optional(),
        priceUSD: z.string().optional(),
        isFeatured: z.number().default(0),
        isAvailable: z.number().default(1),
        displayOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        // Upload image to S3
        const { imageBase64, ...artworkData } = input;
        const imageBuffer = Buffer.from(imageBase64.split(',')[1] || imageBase64, 'base64');
        const fileKey = `artworks/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { url: imageUrl } = await storagePut(fileKey, imageBuffer, 'image/jpeg');

        await db.createArtwork({
          ...artworkData,
          imageUrl,
          imageKey: fileKey,
        });
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        collectionId: z.number().optional(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        imageBase64: z.string().optional(),
        dimensions: z.string().optional(),
        medium: z.string().optional(),
        priceZAR: z.string().optional(),
        priceUSD: z.string().optional(),
        isFeatured: z.number().optional(),
        isAvailable: z.number().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, imageBase64, ...data } = input;
        
        // If new image provided, upload to S3
        if (imageBase64) {
          const imageBuffer = Buffer.from(imageBase64.split(',')[1] || imageBase64, 'base64');
          const fileKey = `artworks/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          const { url: imageUrl } = await storagePut(fileKey, imageBuffer, 'image/jpeg');
          
          await db.updateArtwork(id, {
            ...data,
            imageUrl,
            imageKey: fileKey,
          });
        } else {
          await db.updateArtwork(id, data);
        }
        
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteArtwork(input.id);
        return { success: true };
      }),
  }),

  // ============ CONTACT ROUTES ============
  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        subject: z.enum(["general", "commission", "purchase", "other"]),
        message: z.string().min(1),
        commissionType: z.string().optional(),
        commissionSize: z.string().optional(),
        commissionBudget: z.string().optional(),
        commissionTimeline: z.string().optional(),
        commissionReferences: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createContactSubmission(input);
        return { success: true };
      }),

    list: adminProcedure.query(async () => {
      return await db.getAllContactSubmissions();
    }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "read", "replied", "archived"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateContactSubmissionStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ============ COMMENT ROUTES ============
  comments: router({
    listByArtwork: publicProcedure
      .input(z.object({ artworkId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCommentsByArtwork(input.artworkId);
      }),

    listAll: adminProcedure.query(async () => {
      return await db.getAllComments();
    }),

    create: publicProcedure
      .input(z.object({
        artworkId: z.number(),
        name: z.string().min(1),
        email: z.string().email().optional(),
        comment: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        await db.createComment({
          ...input,
          isApproved: 0, // Requires admin approval
        });
        return { success: true };
      }),

    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.approveComment(input.id);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteComment(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
