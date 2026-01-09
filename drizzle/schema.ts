import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Collections/Categories for organizing artworks
 */
export const collections = mysqlTable("collections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

/**
 * Artworks table with all required fields
 */
export const artworks = mysqlTable("artworks", {
  id: int("id").autoincrement().primaryKey(),
  collectionId: int("collectionId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("imageUrl").notNull(),
  imageKey: text("imageKey").notNull(),
  dimensions: varchar("dimensions", { length: 100 }),
  medium: varchar("medium", { length: 100 }),
  priceZAR: decimal("priceZAR", { precision: 10, scale: 2 }),
  priceUSD: decimal("priceUSD", { precision: 10, scale: 2 }),
  isFeatured: int("isFeatured").default(0).notNull(),
  isAvailable: int("isAvailable").default(1).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Artwork = typeof artworks.$inferSelect;
export type InsertArtwork = typeof artworks.$inferInsert;

/**
 * Contact form submissions
 */
export const contactSubmissions = mysqlTable("contactSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: mysqlEnum("subject", ["general", "commission", "purchase", "other"]).notNull(),
  message: text("message").notNull(),
  commissionType: varchar("commissionType", { length: 100 }),
  commissionSize: varchar("commissionSize", { length: 100 }),
  commissionBudget: varchar("commissionBudget", { length: 100 }),
  commissionTimeline: varchar("commissionTimeline", { length: 100 }),
  commissionReferences: text("commissionReferences"),
  status: mysqlEnum("status", ["new", "read", "replied", "archived"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;

/**
 * Comments on artworks
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  artworkId: int("artworkId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  comment: text("comment").notNull(),
  isApproved: int("isApproved").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * About page content - editable by admin
 */
export const aboutContent = mysqlTable("aboutContent", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull().default("About the Artist"),
  content: text("content").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AboutContent = typeof aboutContent.$inferSelect;
export type InsertAboutContent = typeof aboutContent.$inferInsert;
