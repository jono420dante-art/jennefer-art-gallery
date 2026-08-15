import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is unavailable to the diagnostic script.");
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [summary] = await connection.query(`
    SELECT
      (SELECT COUNT(*) FROM analyticsSessions) AS sessions,
      (SELECT COUNT(*) FROM analyticsEvents) AS events,
      (SELECT COUNT(*) FROM analyticsEvents WHERE eventType = 'page_view') AS pageViews
  `);
  console.log(JSON.stringify(summary[0]));
} finally {
  connection.destroy();
}
