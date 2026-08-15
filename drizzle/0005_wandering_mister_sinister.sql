CREATE TABLE IF NOT EXISTS `newsletterSignups` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `firstName` VARCHAR(100) NOT NULL,
  `lastName` VARCHAR(100) NOT NULL,
  `email` VARCHAR(320) NOT NULL,
  `isSubscribed` INT NOT NULL DEFAULT 1,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `newsletterSignups_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `analyticsSessions` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `sessionId` VARCHAR(64) NOT NULL,
  `landingPath` VARCHAR(500) NOT NULL,
  `referrerDomain` VARCHAR(255),
  `source` VARCHAR(120) NOT NULL,
  `medium` VARCHAR(120),
  `campaign` VARCHAR(180),
  `deviceType` VARCHAR(20),
  `firstSeenAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastSeenAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `analyticsSessions_sessionId_unique` (`sessionId`),
  KEY `analyticsSessions_lastSeenAt_idx` (`lastSeenAt`),
  KEY `analyticsSessions_source_idx` (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `analyticsEvents` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `sessionId` VARCHAR(64) NOT NULL,
  `eventType` VARCHAR(80) NOT NULL,
  `pagePath` VARCHAR(500) NOT NULL,
  `target` VARCHAR(255),
  `artworkId` INT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `analyticsEvents_createdAt_idx` (`createdAt`),
  KEY `analyticsEvents_eventType_idx` (`eventType`),
  KEY `analyticsEvents_sessionId_idx` (`sessionId`),
  KEY `analyticsEvents_target_idx` (`target`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
