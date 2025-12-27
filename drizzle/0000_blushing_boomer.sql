CREATE TABLE `anime` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`title_japanese` text,
	`anime_other_name` text,
	`anime_type` text,
	`airing_status` text,
	`watch_status` text,
	`website_link` text,
	`episode_on` text,
	`cover_image` text NOT NULL,
	`banner_image` text,
	`episodes` integer DEFAULT 0 NOT NULL,
	`episodes_watched` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`score` integer,
	`genres` text DEFAULT '[]' NOT NULL,
	`synopsis` text,
	`season` text,
	`year` integer,
	`start_date` text,
	`end_date` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`username` text,
	`email` text,
	`password` text NOT NULL,
	`url` text,
	`notes` text,
	`icon` text,
	`last_updated` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`cover_image` text NOT NULL,
	`platform` text DEFAULT '[]' NOT NULL,
	`status` text NOT NULL,
	`hours_played` real DEFAULT 0 NOT NULL,
	`score` integer,
	`genres` text DEFAULT '[]' NOT NULL,
	`developer` text,
	`publisher` text,
	`release_date` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `genshin_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`uid` text NOT NULL,
	`adventure_rank` integer DEFAULT 1 NOT NULL,
	`world_level` integer DEFAULT 0 NOT NULL,
	`primogems` integer DEFAULT 0 NOT NULL,
	`intertwined` integer DEFAULT 0 NOT NULL,
	`acquaint` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `genshin_characters` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`name` text NOT NULL,
	`element` text NOT NULL,
	`weapon` text NOT NULL,
	`rarity` integer NOT NULL,
	`constellation` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`friendship` integer DEFAULT 0 NOT NULL,
	`image` text NOT NULL,
	`obtained` integer DEFAULT true NOT NULL,
	`tier` text,
	`type` text,
	`type2` text,
	`build_notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `genshin_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `kdrama` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`title_korean` text,
	`poster_image` text NOT NULL,
	`episodes` integer DEFAULT 0 NOT NULL,
	`episodes_watched` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`score` integer,
	`genres` text DEFAULT '[]' NOT NULL,
	`synopsis` text,
	`network` text,
	`year` integer,
	`cast` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `movies` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`poster_image` text NOT NULL,
	`backdrop_image` text,
	`release_date` text NOT NULL,
	`runtime` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`score` integer,
	`genres` text DEFAULT '[]' NOT NULL,
	`synopsis` text,
	`director` text,
	`cast` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`avatar` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `websites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`favicon` text,
	`is_favorite` integer DEFAULT false NOT NULL,
	`last_visited` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
