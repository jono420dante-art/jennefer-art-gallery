CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artworkId` int NOT NULL,
	`buyerName` varchar(100) NOT NULL,
	`buyerEmail` varchar(320) NOT NULL,
	`buyerPhone` varchar(50),
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'ZAR',
	`paymentMethod` enum('paypal','mastercard') NOT NULL,
	`paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`transactionId` varchar(200),
	`shippingAddress` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paypalEmail` varchar(320),
	`mastercardName` varchar(200),
	`mastercardNumber` text,
	`mastercardExpiry` varchar(10),
	`mastercardCVC` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentSettings_id` PRIMARY KEY(`id`)
);
