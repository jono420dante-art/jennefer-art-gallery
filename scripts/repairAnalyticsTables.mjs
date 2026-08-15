import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is unavailable to the repair script.");
}

const connection = await mysql.createConnection(databaseUrl);

try {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`analyticsSessions\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`sessionId\` VARCHAR(64) NOT NULL,
      \`landingPath\` VARCHAR(500) NOT NULL,
      \`referrerDomain\` VARCHAR(255),
      \`source\` VARCHAR(120) NOT NULL,
      \`medium\` VARCHAR(120),
      \`campaign\` VARCHAR(180),
      \`deviceType\` VARCHAR(20),
      \`firstSeenAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`lastSeenAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`analyticsSessions_sessionId_unique\` (\`sessionId\`),
      KEY \`analyticsSessions_lastSeenAt_idx\` (\`lastSeenAt\`),
      KEY \`analyticsSessions_source_idx\` (\`source\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`analyticsEvents\` (
      \`id\` INT AUTO_INCREMENT NOT NULL,
      \`sessionId\` VARCHAR(64) NOT NULL,
      \`eventType\` VARCHAR(80) NOT NULL,
      \`pagePath\` VARCHAR(500) NOT NULL,
      \`target\` VARCHAR(255),
      \`artworkId\` INT,
      \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`analyticsEvents_createdAt_idx\` (\`createdAt\`),
      KEY \`analyticsEvents_eventType_idx\` (\`eventType\`),
      KEY \`analyticsEvents_sessionId_idx\` (\`sessionId\`),
      KEY \`analyticsEvents_target_idx\` (\`target\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const [tables] = await connection.query(
    `SELECT TABLE_NAME
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name IN ('analyticsSessions', 'analyticsEvents')
     ORDER BY TABLE_NAME`
  );

  console.log(JSON.stringify({ repaired: true, tables }));
} finally {
  connection.destroy();
}
