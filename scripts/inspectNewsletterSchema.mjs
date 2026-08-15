import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is unavailable to the diagnostic script.");
}

const connection = await mysql.createConnection(databaseUrl);

try {
  const [tables] = await connection.query(
    `SELECT TABLE_NAME
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = 'newsletterSignups'`
  );

  console.log(JSON.stringify({ tableExists: tables.length === 1 }));

  if (tables.length === 1) {
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
       FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'newsletterSignups'
       ORDER BY ORDINAL_POSITION`
    );
    const [counts] = await connection.query(
      "SELECT COUNT(*) AS subscriberCount FROM `newsletterSignups`"
    );
    console.log(JSON.stringify({ columns, subscriberCount: counts[0].subscriberCount }));
  }
} finally {
  await connection.end();
}
