CREATE TABLE `aboutContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL DEFAULT 'About the Artist',
	`content` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aboutContent_id` PRIMARY KEY(`id`)
);
