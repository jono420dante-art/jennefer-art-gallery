import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is unavailable to the repair script.");
}

const connection = await mysql.createConnection(databaseUrl);

try {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`newsletterSignups\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`firstName\` VARCHAR(100) NOT NULL,
      \`lastName\` VARCHAR(100) NOT NULL,
      \`email\` VARCHAR(320) NOT NULL,
      \`isSubscribed\` INT NOT NULL DEFAULT 1,
      \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`newsletterSignups_email_unique\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const [rows] = await connection.query(
    "SELECT COUNT(*) AS subscriberCount FROM `newsletterSignups`"
  );

  console.log(JSON.stringify({
    repaired: true,
    subscriberCount: rows[0].subscriberCount,
  }));
} finally {
  connection.destroy();
}
