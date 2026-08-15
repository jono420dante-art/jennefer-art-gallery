CREATE TABLE `notificationEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`body` text NOT NULL,
	`type` enum('review','message','sale','collector','system') NOT NULL,
	`metadata` text,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificationEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `notificationEvents_createdAt_idx` ON `notificationEvents` (`createdAt`);--> statement-breakpoint
CREATE INDEX `notificationEvents_isRead_idx` ON `notificationEvents` (`isRead`);--> statement-breakpoint
CREATE INDEX `notificationEvents_type_idx` ON `notificationEvents` (`type`);