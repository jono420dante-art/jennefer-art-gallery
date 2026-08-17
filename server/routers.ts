import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { createAnalyticsPdf } from "./analyticsReport";
import { areNativeAdminCredentialsValid, createNativeAdminSession, NATIVE_ADMIN_COOKIE } from "./_core/nativeAdminAuth";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    nativeAdminLogin: publicProcedure
      .input(z.object({
        username: z.string().min(1).max(120),
        password: z.string().min(1).max(512),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!areNativeAdminCredentialsValid(input.username, input.password)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid Administrator credentials" });
        }

        const sessionToken = await createNativeAdminSession();
        ctx.res.cookie(NATIVE_ADMIN_COOKIE, sessionToken, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: 8 * 60 * 60 * 1000,
        });
        return {
          success: true as const,
          user: {
            id: 0,
            openId: "gallery-native-admin",
            name: "Gallery Administrator",
            email: null,
            loginMethod: "native_admin",
            role: "admin" as const,
          },
        };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(NATIVE_ADMIN_COOKIE, { ...cookieOptions, maxAge: -1 });
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
        if (input.isAvailable === 0) {
          await db.recordNotificationEvent({
            title: "Artwork marked sold",
            body: "An artwork availability status was changed to sold in the protected management studio.",
            type: "sale",
            metadata: { artworkId: input.id },
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
        await db.recordNotificationEvent({
          title: "Collector enquiry received",
          body: `${input.subject} enquiry received from a gallery visitor.`,
          type: "message",
        });
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
        await db.recordNotificationEvent({
          title: "Comment awaiting moderation",
          body: "A visitor comment has been submitted for Administrator review.",
          type: "review",
          metadata: { artworkId: input.artworkId },
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

    getAllPublicComments: publicProcedure.query(async () => {
      return await db.getAllPublicComments();
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
    get: adminProcedure.query(async () => {
      return await db.getPaymentSettings();
    }),

    getPublicCheckout: publicProcedure.query(async () => {
      return await db.getPublicCheckoutPaymentSettings();
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
        await db.recordNotificationEvent({
          title: "Review awaiting moderation",
          body: "A visitor review has been submitted for Administrator review.",
          type: "review",
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

  // ============ NOTIFICATIONS ROUTES ============
  notifications: router({
    sendToAdmin: adminProcedure
      .input(z.object({
        title: z.string(),
        body: z.string(),
        type: z.enum(['review', 'message', 'sale', 'system']),
        data: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ input }) => {
        await db.recordNotificationEvent({
          title: input.title,
          body: input.body,
          type: input.type,
          metadata: input.data,
        });
        return { success: true };
      }),

    list: adminProcedure.query(async () => {
      return await db.getNotificationEvents();
    }),

    markRead: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.markNotificationEventRead(input.id);
      return { success: true };
    }),

    markAllRead: adminProcedure.mutation(async () => {
      await db.markAllNotificationEventsRead();
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
        await db.recordNotificationEvent({
          title: "New order created",
          body: `A ${input.currency} order was created from the public checkout flow.`,
          type: "sale",
          metadata: { artworkId: input.artworkId },
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
  
  // ============ NEWSLETTER ROUTES ============
  newsletter: router({
    signup: publicProcedure
      .input(z.object({
        firstName: z.string().trim().max(100).default(""),
        lastName: z.string().trim().max(100).default(""),
        email: z.string().email("Valid email is required"),
        consent: z.literal(true),
      }))
      .mutation(async ({ input }) => {
        // Check if email already exists
        const existing = await db.getNewsletterSignupByEmail(input.email);
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This email is already subscribed to our newsletter',
          });
        }
        
        await db.createNewsletterSignup({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
        });
        await db.recordNotificationEvent({
          title: "Collector joined the mailing list",
          body: "A new visitor gave explicit consent to receive gallery updates.",
          type: "collector",
        });
        return { success: true, message: 'Successfully subscribed to newsletter' };
      }),
    
    list: adminProcedure.query(async () => {
      return await db.getAllNewsletterSignups();
    }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteNewsletterSignup(input.id);
        return { success: true };
      }),
  }),

  // ============ FIRST-PARTY ANALYTICS ROUTES ============
  analytics: router({
    track: publicProcedure
      .input(z.object({
        sessionId: z.string().min(16).max(64),
        landingPath: z.string().min(1).max(500),
        referrerDomain: z.string().max(255).optional(),
        source: z.string().min(1).max(120),
        medium: z.string().max(120).optional(),
        campaign: z.string().max(180).optional(),
        deviceType: z.enum(["mobile", "tablet", "desktop", "unknown"]).optional(),
        eventType: z.enum([
          "page_view",
          "heartbeat",
          "engagement_tick",
          "click_artwork",
          "click_checkout",
          "click_reserve",
          "click_whatsapp",
          "click_commission",
          "click_newsletter",
          "click_share",
          "scroll_depth",
        ]),
        pagePath: z.string().min(1).max(500),
        target: z.string().max(255).optional(),
        artworkId: z.number().int().positive().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.recordAnalyticsEvent(input);
        return { success: true };
      }),

    summary: adminProcedure
      .input(z.object({ days: z.number().int().min(1).max(90).default(7) }).optional())
      .query(async ({ input }) => {
        return await db.getAnalyticsSummary(input?.days ?? 7);
      }),

    clearExpired: adminProcedure
      .input(z.object({ retentionDays: z.number().int().min(30).max(365).default(90) }))
      .mutation(async ({ input }) => {
        await db.deleteAnalyticsOlderThan(input.retentionDays);
        return { success: true };
      }),

    downloadReport: adminProcedure
      .input(z.object({ days: z.number().int().min(1).max(90).default(7) }))
      .query(async ({ input }) => {
        const summary = await db.getAnalyticsSummary(input.days);
        const pdf = await createAnalyticsPdf(summary, input.days);
        return {
          filename: `jennefer-ann-growth-report-${input.days}-days.pdf`,
          contentBase64: pdf.toString("base64"),
        };
      }),
  }),

  // ============ EXECUTIVE COMMAND CENTRE ROUTES ============
  dashboard: router({
    summary: adminProcedure
      .input(z.object({ days: z.number().int().min(1).max(90).default(30) }).optional())
      .query(async ({ input }) => db.getExecutiveDashboardSummary(input?.days ?? 30)),
    spotlight: adminProcedure.query(async () => db.getAdminDashboardSettings()),
    selectSpotlightArtwork: adminProcedure
      .input(z.object({ artworkId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const artwork = await db.getArtworkById(input.artworkId);
        if (!artwork) throw new TRPCError({ code: "NOT_FOUND", message: "Artwork not found" });
        await db.updateAdminDashboardSettings({
          spotlightArtworkId: artwork.id,
          spotlightImageUrl: artwork.imageUrl,
          spotlightImageKey: artwork.imageKey,
        });
        return { success: true };
      }),
    uploadSpotlightImage: adminProcedure
      .input(z.object({ imageBase64: z.string().min(32).max(8_000_000) }))
      .mutation(async ({ input }) => {
        const [header, payload] = input.imageBase64.split(",", 2);
        const contentType = /^data:image\/(png|webp|jpeg|jpg);base64$/i.test(header) ? header.match(/^data:(image\/[a-z+.-]+);base64$/i)?.[1] ?? "image/jpeg" : "image/jpeg";
        const imageBuffer = Buffer.from(payload || input.imageBase64, "base64");
        if (!imageBuffer.length) throw new TRPCError({ code: "BAD_REQUEST", message: "A valid image is required" });
        const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
        const fileKey = `admin-spotlight/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
        const { url } = await storagePut(fileKey, imageBuffer, contentType);
        await db.updateAdminDashboardSettings({ spotlightArtworkId: null, spotlightImageUrl: url, spotlightImageKey: fileKey });
        return { success: true, url };
      }),
  }),
});
export type AppRouter = typeof appRouter;
