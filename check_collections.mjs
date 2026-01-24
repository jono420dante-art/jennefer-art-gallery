import { drizzle } from "drizzle-orm/mysql2";
import { collections } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);
const result = await db.select().from(collections);
console.log("Collections in database:");
result.forEach(c => console.log(`- ID: ${c.id}, Name: "${c.name}", Slug: "${c.slug}"`));
