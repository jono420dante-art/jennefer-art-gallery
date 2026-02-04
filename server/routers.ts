import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";

// Admin-only procedure - allows both Manus OAuth admin and localStorage admin token
const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  const isMaunsAdmin = ctx.user?.role === 'admin';
  const isTokenAdmin = ctx.isAdminAuth === true;
  
  if (!isMaunsAdmin && !isTokenAdmin) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Please login (10001)' });
  }
  return next({ ctx });
});

// Public procedure that can be used for public admin operations
const publicAdminProcedure = publicProcedure.use(({ ctx, next }) => {
  const isTokenAdmin = ctx.isAdminAuth === true;
  
  if (!isTokenAdmin) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Please login (10001)' });
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
        priceZAR: z.union([z.string(), z.number()]).nullable().optional(),
        priceUSD: z.union([z.string(), z.number()]).nullable().optional(),
        isFeatured: z.number().default(0),
        isAvailable: z.number().default(1),
        displayOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        // Upload image to S3
        const { imageBase64, priceZAR, priceUSD, ...artworkData } = input;
        const imageBuffer = Buffer.from(imageBase64.split(',')[1] || imageBase64, 'base64');
        const fileKey = `artworks/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { url: imageUrl } = await storagePut(fileKey, imageBuffer, 'image/jpeg');

        // Convert prices to strings if they are numbers
        const convertedPriceZAR = priceZAR !== null && priceZAR !== undefined ? String(priceZAR) : null;
        const convertedPriceUSD = priceUSD !== null && priceUSD !== undefined ? String(priceUSD) : null;

        await db.createArtwork({
          ...artworkData,
          priceZAR: convertedPriceZAR,
          priceUSD: convertedPriceUSD,
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
        priceZAR: z.union([z.string(), z.number()]).nullable().optional(),
        priceUSD: z.union([z.string(), z.number()]).nullable().optional(),
        isFeatured: z.number().optional(),
        isAvailable: z.number().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, imageBase64, priceZAR, priceUSD, ...data } = input;
        
        // Convert prices to strings if they are numbers
        const convertedPriceZAR = priceZAR !== null && priceZAR !== undefined ? String(priceZAR) : undefined;
        const convertedPriceUSD = priceUSD !== null && priceUSD !== undefined ? String(priceUSD) : undefined;
        
        // If new image provided, upload to S3
        if (imageBase64) {
          const imageBuffer = Buffer.from(imageBase64.split(',')[1] || imageBase64, 'base64');
          const fileKey = `artworks/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          const { url: imageUrl } = await storagePut(fileKey, imageBuffer, 'image/jpeg');
          
          await db.updateArtwork(id, {
            ...data,
            ...(convertedPriceZAR !== undefined && { priceZAR: convertedPriceZAR }),
            ...(convertedPriceUSD !== undefined && { priceUSD: convertedPriceUSD }),
            imageUrl,
            imageKey: fileKey,
          });
        } else {
          await db.updateArtwork(id, {
            ...data,
            ...(convertedPriceZAR !== undefined && { priceZAR: convertedPriceZAR }),
            ...(convertedPriceUSD !== undefined && { priceUSD: convertedPriceUSD }),
          });
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

    list: publicProcedure.query(async () => {
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

    listAll: publicProcedure.query(async () => {
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

    getPublicComments: publicProcedure
      .input(z.object({ artworkId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPublicCommentsByArtwork(input.artworkId);
      }),

    getPublicReviews: publicProcedure.query(async () => {
      return await db.getPublicReviews();
    }),
  }),

  // ============ ABOUT CONTENT ROUTES ============
  about: router({
    get: publicProcedure.query(async () => {
      return await db.getAboutContent();
    }),

    update: adminProcedure
      .input(z.object({
        title: z.string().optional(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        await db.updateAboutContent(input);
        return { success: true };
      }),
  }),

  // ============ PAYMENT SETTINGS ROUTES ============
  paymentSettings: router({
    get: publicProcedure.query(async () => {
      return await db.getPaymentSettings();
    }),

    update: adminProcedure
      .input(z.object({
        paypalEmail: z.string().email().optional(),
        mastercardName: z.string().optional(),
        mastercardNumber: z.string().optional(),
        mastercardExpiry: z.string().optional(),
        mastercardCVC: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updatePaymentSettings(input);
        return { success: true };
      }),
  }),

  // ============ WIP IMAGES ROUTES ============
  wipImages: router({
    list: publicProcedure.query(async () => {
      return await db.getActiveWipImages();
    }),

    listAll: adminProcedure.query(async () => {
      return await db.getAllWipImages();
    }),

    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        imageBase64: z.string(),
        progress: z.number().min(0).max(100).default(50),
        isActive: z.number().default(1),
        displayOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const { imageBase64, ...data } = input;
        const imageBuffer = Buffer.from(imageBase64.split(',')[1] || imageBase64, 'base64');
        const fileKey = `wip/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { url: imageUrl } = await storagePut(fileKey, imageBuffer, 'image/jpeg');

        await db.createWipImage({
          ...data,
          imageUrl,
          imageKey: fileKey,
        });
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        imageBase64: z.string().optional(),
        progress: z.number().min(0).max(100).optional(),
        isActive: z.number().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, imageBase64, ...data } = input;
        
        if (imageBase64) {
          const imageBuffer = Buffer.from(imageBase64.split(',')[1] || imageBase64, 'base64');
          const fileKey = `wip/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          const { url: imageUrl } = await storagePut(fileKey, imageBuffer, 'image/jpeg');
          await db.updateWipImage(id, { ...data, imageUrl, imageKey: fileKey });
        } else {
          await db.updateWipImage(id, data);
        }
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteWipImage(input.id);
        return { success: true };
      }),
  }),

  // ============ REVIEWS ROUTES ============
  reviews: router({
    list: publicProcedure.query(async () => {
      return await db.getApprovedReviews();
    }),

    listAll: adminProcedure.query(async () => {
      return await db.getAllReviews();
    }),

    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createReview({
          ...input,
          isApproved: 0, // Requires admin approval
        });
        return { success: true };
      }),

    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.approveReview(input.id);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteReview(input.id);
        return { success: true };
      }),
  }),

  // ============ ORDER ROUTES ============
  orders: router({
    create: publicProcedure
      .input(z.object({
        artworkId: z.number(),
        buyerName: z.string().min(1),
        buyerEmail: z.string().email(),
        buyerPhone: z.string().optional(),
        amount: z.string(),
        currency: z.string().default("ZAR"),
        paymentMethod: z.enum(["paypal", "mastercard"]),
        shippingAddress: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createOrder({
          artworkId: input.artworkId,
          buyerName: input.buyerName,
          buyerEmail: input.buyerEmail,
          buyerPhone: input.buyerPhone,
          amount: input.amount,
          currency: input.currency,
          paymentMethod: input.paymentMethod,
          shippingAddress: input.shippingAddress,
          notes: input.notes,
        });
        return { success: true };
      }),

    list: adminProcedure.query(async () => {
      return await db.getAllOrders();
    }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "completed", "failed", "refunded"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
