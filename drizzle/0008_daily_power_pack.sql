CREATE TABLE `analyticsIntegrationSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gaMeasurementId` varchar(48),
	`gaPropertyId` varchar(96),
	`dataApiConnected` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analyticsIntegrationSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contactReplyDrafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactSubmissionId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`subject` varchar(200) NOT NULL,
	`body` text NOT NULL,
	`status` enum('draft','sent') NOT NULL DEFAULT 'draft',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contactReplyDrafts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletterCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`subject` varchar(200) NOT NULL,
	`body` text NOT NULL,
	`status` enum('draft','sent') NOT NULL DEFAULT 'draft',
	`recipientCount` int NOT NULL DEFAULT 0,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletterCampaigns_id` PRIMARY KEY(`id`)
);
