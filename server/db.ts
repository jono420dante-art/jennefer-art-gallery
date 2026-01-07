import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  collections, 
  artworks, 
  contactSubmissions, 
  comments,
  InsertCollection,
  InsertArtwork,
  InsertContactSubmission,
  InsertComment
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
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

export async function createCollection(data: InsertCollection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(collections).values(data);
  return result;
}

export async function updateCollection(id: number, data: Partial<InsertCollection>) {
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

export async function createArtwork(data: InsertArtwork) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(artworks).values(data);
  return result;
}

export async function updateArtwork(id: number, data: Partial<InsertArtwork>) {
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

export async function createContactSubmission(data: InsertContactSubmission) {
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

export async function createComment(data: InsertComment) {
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
