import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mysql, { type Connection } from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;
let connection: Connection | undefined;

describe.skipIf(!databaseUrl)("newsletterSignups live schema", () => {
  beforeAll(async () => {
    connection = await mysql.createConnection(databaseUrl!);
  });

  afterAll(() => {
    connection?.destroy();
  });

  it("has the subscriber table required by the newsletter duplicate check", async () => {
    const [rows] = await connection!.query<Array<{ TABLE_NAME: string }>>(
      `SELECT TABLE_NAME
       FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = 'newsletterSignups'`
    );

    expect(rows).toHaveLength(1);
  });

  it("has all expected subscriber columns and an email uniqueness constraint", async () => {
    const [columns] = await connection!.query<Array<{ COLUMN_NAME: string }>>(
      `SELECT COLUMN_NAME
       FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'newsletterSignups'
       ORDER BY ORDINAL_POSITION`
    );
    const [indexes] = await connection!.query<Array<{ Key_name: string; Non_unique: number }>>(
      "SHOW INDEX FROM `newsletterSignups`"
    );

    expect(columns.map((column) => column.COLUMN_NAME)).toEqual([
      "id",
      "firstName",
      "lastName",
      "email",
      "isSubscribed",
      "createdAt",
      "updatedAt",
    ]);
    expect(indexes.some((index) => (
      index.Key_name === "newsletterSignups_email_unique" && index.Non_unique === 0
    ))).toBe(true);
  });
});
