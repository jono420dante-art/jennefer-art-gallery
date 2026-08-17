CREATE TABLE `adminDashboardSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`spotlightArtworkId` int,
	`spotlightImageUrl` text,
	`spotlightImageKey` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminDashboardSettings_id` PRIMARY KEY(`id`)
);
