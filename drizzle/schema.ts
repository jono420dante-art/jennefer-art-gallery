import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, varchar, text, timestamp, index, decimal, mysqlEnum } from "drizzle-orm/mysql-core"
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
	id: int().autoincrement().notNull(),
	firstName: varchar({ length: 100 }).notNull(),
	lastName: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	isSubscribed: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("newsletterSignups_email_unique").on(table.email),
]);
