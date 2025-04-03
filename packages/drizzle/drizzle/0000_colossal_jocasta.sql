-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `schema_version` (
	`version` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `extensions` (
	`ext_id` integer PRIMARY KEY AUTOINCREMENT,
	`identifier` text NOT NULL,
	`version` text NOT NULL,
	`enabled` numeric DEFAULT (TRUE),
	`path` text,
	`data` numeric,
	`installed_at` numeric DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `commands` (
	`cmd_id` integer PRIMARY KEY AUTOINCREMENT,
	`ext_id` integer NOT NULL,
	`name` text NOT NULL,
	`enabled` numeric DEFAULT (TRUE),
	`alias` text,
	`hotkey` text,
	`type` text NOT NULL,
	`data` numeric,
	FOREIGN KEY (`ext_id`) REFERENCES `extensions`(`ext_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `extension_data` (
	`data_id` integer PRIMARY KEY AUTOINCREMENT,
	`ext_id` integer NOT NULL,
	`data_type` text NOT NULL,
	`data` numeric NOT NULL,
	`metadata` numeric,
	`search_text` text,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`ext_id`) REFERENCES `extensions`(`ext_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `extension_data_fts` (
	`data_id` numeric,
	`search_text` numeric,
	`extension_data_fts` numeric,
	`rank` numeric
);
--> statement-breakpoint
CREATE TABLE `extension_data_fts_data` (
	`id` integer PRIMARY KEY,
	`block` blob
);
--> statement-breakpoint
CREATE TABLE `extension_data_fts_idx` (
	`segid` numeric NOT NULL,
	`term` numeric NOT NULL,
	`pgno` numeric,
	PRIMARY KEY(`segid`, `term`)
);
--> statement-breakpoint
CREATE TABLE `extension_data_fts_docsize` (
	`id` integer PRIMARY KEY,
	`sz` blob
);
--> statement-breakpoint
CREATE TABLE `extension_data_fts_config` (
	`k` numeric PRIMARY KEY NOT NULL,
	`v` numeric
);

*/