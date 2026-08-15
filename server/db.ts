import { eq, desc, and, count, gte, lt, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  users, 
  collections, 
  artworks, 
  contactSubmissions, 
  comments,
  wipImages,
  reviews,
  orders,
  paymentSettings,
  aboutContent,
  newsletterSignups,
  analyticsSessions,
  analyticsEvents,
  notificationEvents
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function upsertUser(user: any): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: any = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ COLLECTION FUNCTIONS ============

export async function getAllCollections() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(collections).orderBy(collections.displayOrder);
}

export async function getCollectionBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(collections).where(eq(collections.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCollection(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if slug already exists
  if (data.slug) {
    const existing = await db.select().from(collections).where(eq(collections.slug, data.slug));
    if (existing.length > 0) {
      throw new Error(`A collection with slug "${data.slug}" already exists. Please use a different slug.`);
    }
  }
  
  const result = await db.insert(collections).values(data);
  return result;
}

export async function updateCollection(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(collections).set(data).where(eq(collections.id, id));
}

export async function deleteCollection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(collections).where(eq(collections.id, id));
}

// ============ ARTWORK FUNCTIONS ============

export async function getAllArtworks() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(artworks).orderBy(desc(artworks.createdAt));
}

export async function getArtworksByCollection(collectionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(artworks)
    .where(eq(artworks.collectionId, collectionId))
    .orderBy(artworks.displayOrder);
}

export async function getFeaturedArtworks() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(artworks)
    .where(eq(artworks.isFeatured, 1))
    .orderBy(artworks.displayOrder)
    .limit(6);
}

export async function getArtworkBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(artworks).where(eq(artworks.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getArtworkById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(artworks).where(eq(artworks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createArtwork(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(artworks).values(data);
  return result;
}

export async function updateArtwork(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(artworks).set(data).where(eq(artworks.id, id));
}

export async function deleteArtwork(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(artworks).where(eq(artworks.id, id));
}

// ============ CONTACT SUBMISSION FUNCTIONS ============

export async function createContactSubmission(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contactSubmissions).values(data);
  return result;
}

export async function getAllContactSubmissions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
}

export async function updateContactSubmissionStatus(id: number, status: "new" | "read" | "replied" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contactSubmissions).set({ status }).where(eq(contactSubmissions.id, id));
}

// ============ COMMENT FUNCTIONS ============

export async function getCommentsByArtwork(artworkId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(comments)
    .where(and(eq(comments.artworkId, artworkId), eq(comments.isApproved, 1)))
    .orderBy(desc(comments.createdAt));
}

export async function getAllComments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(comments).orderBy(desc(comments.createdAt));
}

export async function createComment(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(comments).values(data);
  return result;
}

export async function approveComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(comments).set({ isApproved: 1 }).where(eq(comments.id, id));
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(comments).where(eq(comments.id, id));
}

export async function getPublicCommentsByArtwork(artworkId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(comments)
    .where(and(eq(comments.artworkId, artworkId), eq(comments.isApproved, 1)))
    .orderBy(desc(comments.createdAt));
}

export async function getAllPublicComments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(comments)
    .where(eq(comments.isApproved, 1))
    .orderBy(desc(comments.createdAt));
}

export async function getPublicReviews() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reviews)
    .where(eq(reviews.isApproved, 1))
    .orderBy(desc(reviews.createdAt));
}

// ============ ABOUT CONTENT FUNCTIONS ============

export async function getAboutContent() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(aboutContent).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateAboutContent(data: { title?: string; content: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getAboutContent();
  if (existing) {
    await db.update(aboutContent).set(data).where(eq(aboutContent.id, existing.id));
  } else {
    await db.insert(aboutContent).values({
      title: data.title || "About the Artist",
      content: data.content,
    });
  }
}

// ============ PAYMENT SETTINGS FUNCTIONS ============

export async function getPaymentSettings() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(paymentSettings).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getPublicCheckoutPaymentSettings() {
  const settings = await getPaymentSettings();
  return settings ? { paypalEmail: settings.paypalEmail } : null;
}

export async function updatePaymentSettings(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getPaymentSettings();
  if (existing) {
    await db.update(paymentSettings).set(data).where(eq(paymentSettings.id, existing.id));
  } else {
    await db.insert(paymentSettings).values(data);
  }
}

// ============ ORDER FUNCTIONS ============

export async function createOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: "pending" | "completed" | "failed" | "refunded") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ paymentStatus: status }).where(eq(orders.id, id));
}

// ============ WIP IMAGES FUNCTIONS ============

export async function getAllWipImages() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(wipImages).orderBy(wipImages.displayOrder);
}

export async function getActiveWipImages() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(wipImages)
    .where(eq(wipImages.isActive, 1))
    .orderBy(wipImages.displayOrder);
}

export async function createWipImage(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(wipImages).values(data);
  return result;
}

export async function updateWipImage(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(wipImages).set(data).where(eq(wipImages.id, id));
}

export async function deleteWipImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(wipImages).where(eq(wipImages.id, id));
}

// ============ REVIEWS FUNCTIONS ============

export async function getAllReviews() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

export async function getApprovedReviews() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reviews)
    .where(eq(reviews.isApproved, 1))
    .orderBy(desc(reviews.createdAt));
}

export async function createReview(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reviews).values(data);
  return result;
}

export async function approveReview(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reviews).set({ isApproved: 1 }).where(eq(reviews.id, id));
}

export async function deleteReview(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(reviews).where(eq(reviews.id, id));
}

// ============ NEWSLETTER SIGNUP FUNCTIONS ============

export async function createNewsletterSignup(data: { firstName: string; lastName: string; email: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(newsletterSignups).values(data);
  return result;
}

export async function getAllNewsletterSignups() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(newsletterSignups).orderBy(desc(newsletterSignups.createdAt));
}

export async function getNewsletterSignupByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(newsletterSignups).where(eq(newsletterSignups.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteNewsletterSignup(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(newsletterSignups).where(eq(newsletterSignups.id, id));
}

// ============ FIRST-PARTY NOTIFICATION EVENT FUNCTIONS ============

export type NotificationEventType = "review" | "message" | "sale" | "collector" | "system";

export async function recordNotificationEvent(data: {
  title: string;
  body: string;
  type: NotificationEventType;
  metadata?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(notificationEvents).values({
    title: data.title,
    body: data.body,
    type: data.type,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
  });
}

export async function getNotificationEvents(limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notificationEvents).orderBy(desc(notificationEvents.createdAt)).limit(limit);
}

export async function markNotificationEventRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notificationEvents).set({ isRead: 1 }).where(eq(notificationEvents.id, id));
}

export async function markAllNotificationEventsRead() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notificationEvents).set({ isRead: 1 }).where(eq(notificationEvents.isRead, 0));
}

// ============ FIRST-PARTY ANALYTICS FUNCTIONS ============

export type AnalyticsEventInput = {
  sessionId: string;
  landingPath: string;
  referrerDomain?: string;
  source: string;
  medium?: string;
  campaign?: string;
  deviceType?: string;
  eventType: string;
  pagePath: string;
  target?: string;
  artworkId?: number;
};

function mysqlTimestamp(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function recordAnalyticsEvent(data: AnalyticsEventInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = mysqlTimestamp(new Date());
  await db.insert(analyticsSessions).values({
    sessionId: data.sessionId,
    landingPath: data.landingPath,
    referrerDomain: data.referrerDomain,
    source: data.source,
    medium: data.medium,
    campaign: data.campaign,
    deviceType: data.deviceType,
    firstSeenAt: now,
    lastSeenAt: now,
  }).onDuplicateKeyUpdate({
    set: { lastSeenAt: now },
  });

  await db.insert(analyticsEvents).values({
    sessionId: data.sessionId,
    eventType: data.eventType,
    pagePath: data.pagePath,
    target: data.target,
    artworkId: data.artworkId,
    createdAt: now,
  });
}

export async function getAnalyticsSummary(days = 7) {
  const db = await getDb();
  if (!db) {
    return {
      uniqueSessions: 0,
      pageViews: 0,
      conversionClicks: 0,
      activeVisitors: 0,
      trafficSources: [],
      referrers: [],
      topPages: [],
      topClicks: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const rangeStart = mysqlTimestamp(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
  const activeStart = mysqlTimestamp(new Date(Date.now() - 30 * 60 * 1000));

  const [sessionCount] = await db.select({ value: count() })
    .from(analyticsSessions)
    .where(gte(analyticsSessions.firstSeenAt, rangeStart));
  const [pageViewCount] = await db.select({ value: count() })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.eventType, "page_view"),
      gte(analyticsEvents.createdAt, rangeStart),
    ));
  const [conversionClickCount] = await db.select({ value: count() })
    .from(analyticsEvents)
    .where(and(
      like(analyticsEvents.eventType, "click_%"),
      gte(analyticsEvents.createdAt, rangeStart),
    ));
  const [activeVisitorCount] = await db.select({ value: count() })
    .from(analyticsSessions)
    .where(gte(analyticsSessions.lastSeenAt, activeStart));

  const trafficSources = await db.select({
    source: analyticsSessions.source,
    sessions: count(),
  }).from(analyticsSessions)
    .where(gte(analyticsSessions.firstSeenAt, rangeStart))
    .groupBy(analyticsSessions.source)
    .orderBy(desc(count()))
    .limit(8);

  const referrers = await db.select({
    referrerDomain: analyticsSessions.referrerDomain,
    sessions: count(),
  }).from(analyticsSessions)
    .where(and(
      gte(analyticsSessions.firstSeenAt, rangeStart),
      like(analyticsSessions.referrerDomain, "%"),
    ))
    .groupBy(analyticsSessions.referrerDomain)
    .orderBy(desc(count()))
    .limit(8);

  const topPages = await db.select({
    pagePath: analyticsEvents.pagePath,
    views: count(),
  }).from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.eventType, "page_view"),
      gte(analyticsEvents.createdAt, rangeStart),
    ))
    .groupBy(analyticsEvents.pagePath)
    .orderBy(desc(count()))
    .limit(8);

  const topClicks = await db.select({
    eventType: analyticsEvents.eventType,
    target: analyticsEvents.target,
    clicks: count(),
  }).from(analyticsEvents)
    .where(and(
      like(analyticsEvents.eventType, "click_%"),
      gte(analyticsEvents.createdAt, rangeStart),
    ))
    .groupBy(analyticsEvents.eventType, analyticsEvents.target)
    .orderBy(desc(count()))
    .limit(10);

  return {
    uniqueSessions: sessionCount?.value ?? 0,
    pageViews: pageViewCount?.value ?? 0,
    conversionClicks: conversionClickCount?.value ?? 0,
    activeVisitors: activeVisitorCount?.value ?? 0,
    trafficSources,
    referrers: referrers.filter((item) => item.referrerDomain),
    topPages,
    topClicks,
    generatedAt: new Date().toISOString(),
  };
}

export async function deleteAnalyticsOlderThan(days: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const cutoff = mysqlTimestamp(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
  await db.delete(analyticsEvents).where(lt(analyticsEvents.createdAt, cutoff));
  await db.delete(analyticsSessions).where(lt(analyticsSessions.lastSeenAt, cutoff));
}
