import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, varchar, text, timestamp, index, uniqueIndex, decimal, mysqlEnum } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const aboutContent = mysqlTable("aboutContent", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 200 }).default('About the Artist').notNull(),
	content: text().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const artworks = mysqlTable("artworks", {
	id: int().autoincrement().notNull(),
	collectionId: int().notNull(),
	title: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }).notNull(),
	description: text(),
	imageUrl: text().notNull(),
	imageKey: text().notNull(),
	dimensions: varchar({ length: 100 }),
	medium: varchar({ length: 100 }),
	priceZar: decimal({ precision: 10, scale: 2 }),
	priceUsd: decimal({ precision: 10, scale: 2 }),
	isFeatured: int().default(0).notNull(),
	isAvailable: int().default(1).notNull(),
	displayOrder: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("artworks_slug_unique").on(table.slug),
]);

export const collections = mysqlTable("collections", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: text(),
	displayOrder: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("collections_slug_unique").on(table.slug),
]);

export const comments = mysqlTable("comments", {
	id: int().autoincrement().notNull(),
	artworkId: int().notNull(),
	name: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 320 }),
	comment: text().notNull(),
	isApproved: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	isPublic: int().default(1).notNull(),
});

export const contactSubmissions = mysqlTable("contactSubmissions", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }),
	subject: mysqlEnum(['general','commission','purchase','other']).notNull(),
	message: text().notNull(),
	commissionType: varchar({ length: 100 }),
	commissionSize: varchar({ length: 100 }),
	commissionBudget: varchar({ length: 100 }),
	commissionTimeline: varchar({ length: 100 }),
	commissionReferences: text(),
	status: mysqlEnum(['new','read','replied','archived']).default('new').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const orders = mysqlTable("orders", {
	id: int().autoincrement().notNull(),
	artworkId: int().notNull(),
	buyerName: varchar({ length: 100 }).notNull(),
	buyerEmail: varchar({ length: 320 }).notNull(),
	buyerPhone: varchar({ length: 50 }),
	amount: decimal({ precision: 10, scale: 2 }).notNull(),
	currency: varchar({ length: 10 }).default('ZAR').notNull(),
	paymentMethod: mysqlEnum(['paypal','mastercard']).notNull(),
	paymentStatus: mysqlEnum(['pending','completed','failed','refunded']).default('pending').notNull(),
	transactionId: varchar({ length: 200 }),
	shippingAddress: text(),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const paymentSettings = mysqlTable("paymentSettings", {
	id: int().autoincrement().notNull(),
	paypalEmail: varchar({ length: 320 }),
	mastercardName: varchar({ length: 200 }),
	mastercardNumber: text(),
	mastercardExpiry: varchar({ length: 10 }),
	mastercardCvc: text(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const reviews = mysqlTable("reviews", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 320 }),
	rating: int().notNull(),
	comment: text(),
	isApproved: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	isPublic: int().default(1).notNull(),
});

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("users_openId_unique").on(table.openId),
]);

export const wipImages = mysqlTable("wipImages", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	imageUrl: text().notNull(),
	imageKey: text().notNull(),
	progress: int().default(50).notNull(),
	isActive: int().default(1).notNull(),
	displayOrder: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const newsletterSignups = mysqlTable("newsletterSignups", {
	id: int().autoincrement().primaryKey(),
	firstName: varchar({ length: 100 }).notNull(),
	lastName: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	isSubscribed: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	uniqueIndex("newsletterSignups_email_unique").on(table.email),
]);

/**
 * Anonymous, first-party browsing sessions. No raw IP addresses, email addresses,
 * or full user-agent strings are stored in analytics records.
 */
export const analyticsSessions = mysqlTable("analyticsSessions", {
	id: int().autoincrement().primaryKey(),
	sessionId: varchar({ length: 64 }).notNull(),
	landingPath: varchar({ length: 500 }).notNull(),
	referrerDomain: varchar({ length: 255 }),
	source: varchar({ length: 120 }).notNull(),
	medium: varchar({ length: 120 }),
	campaign: varchar({ length: 180 }),
	deviceType: varchar({ length: 20 }),
	firstSeenAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	lastSeenAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	uniqueIndex("analyticsSessions_sessionId_unique").on(table.sessionId),
	index("analyticsSessions_lastSeenAt_idx").on(table.lastSeenAt),
	index("analyticsSessions_source_idx").on(table.source),
]);

/**
 * Aggregatable visitor events for page views and explicit conversion clicks.
 */
export const analyticsEvents = mysqlTable("analyticsEvents", {
	id: int().autoincrement().primaryKey(),
	sessionId: varchar({ length: 64 }).notNull(),
	eventType: varchar({ length: 80 }).notNull(),
	pagePath: varchar({ length: 500 }).notNull(),
	target: varchar({ length: 255 }),
	artworkId: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("analyticsEvents_createdAt_idx").on(table.createdAt),
	index("analyticsEvents_eventType_idx").on(table.eventType),
	index("analyticsEvents_sessionId_idx").on(table.sessionId),
	index("analyticsEvents_target_idx").on(table.target),
	]);

/**
 * Sole-owner visual preferences for the protected Gallery Command Centre.
 * The selected artwork or uploaded image is displayed only inside the
 * Administrator profile spotlight card.
 */
export const adminDashboardSettings = mysqlTable("adminDashboardSettings", {
	id: int().autoincrement().primaryKey(),
	spotlightArtworkId: int(),
	spotlightImageUrl: text(),
	spotlightImageKey: text(),
	updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
});

/** Owner-entered analytics identifiers only. A connected flag remains false until
 * a real Google Analytics Data API integration is authorised. */
export const analyticsIntegrationSettings = mysqlTable("analyticsIntegrationSettings", {
	id: int().autoincrement().primaryKey(),
	gaMeasurementId: varchar({ length: 48 }),
	gaPropertyId: varchar({ length: 96 }),
	dataApiConnected: int().default(0).notNull(),
	updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
});

/** Editorial records for consent-based collector updates. Drafts are durable but
 * never represent email delivery until a sending provider is explicitly connected. */
export const newsletterCampaigns = mysqlTable("newsletterCampaigns", {
	id: int().autoincrement().primaryKey(),
	title: varchar({ length: 200 }).notNull(),
	subject: varchar({ length: 200 }).notNull(),
	body: text().notNull(),
	status: mysqlEnum(["draft", "sent"]).default("draft").notNull(),
	recipientCount: int().default(0).notNull(),
	sentAt: timestamp({ mode: "string" }),
	createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
});

/** Prepared Administrator responses to genuine contact enquiries. A response is
 * only marked sent by an authorised future delivery integration. */
export const contactReplyDrafts = mysqlTable("contactReplyDrafts", {
	id: int().autoincrement().primaryKey(),
	contactSubmissionId: int().notNull(),
	recipientEmail: varchar({ length: 320 }).notNull(),
	subject: varchar({ length: 200 }).notNull(),
	body: text().notNull(),
	status: mysqlEnum(["draft", "sent"]).default("draft").notNull(),
	sentAt: timestamp({ mode: "string" }),
	createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
});

/**
 * First-party operational alerts for the protected Administrator Portal.
 * Metadata stores non-sensitive routing context only; visitor contact details remain in their source records.
 */
export const notificationEvents = mysqlTable("notificationEvents", {
	id: int().autoincrement().primaryKey(),
	title: varchar({ length: 200 }).notNull(),
	body: text().notNull(),
	type: mysqlEnum(["review", "message", "sale", "collector", "system"]).notNull(),
	metadata: text(),
	isRead: int().default(0).notNull(),
	createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
},
(table) => [
	index("notificationEvents_createdAt_idx").on(table.createdAt),
	index("notificationEvents_isRead_idx").on(table.isRead),
	index("notificationEvents_type_idx").on(table.type),
]);
