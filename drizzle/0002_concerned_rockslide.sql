CREATE TABLE `seasons` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`season_year` text NOT NULL,
	`season_name` text NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `team_members` ADD `season_id` text REFERENCES seasons(id);--> statement-breakpoint
ALTER TABLE `teams` ADD `active_season_id` text;