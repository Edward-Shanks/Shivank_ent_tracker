PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_anime` (
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
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_anime`("id", "user_id", "title", "title_japanese", "anime_other_name", "anime_type", "airing_status", "watch_status", "website_link", "episode_on", "cover_image", "banner_image", "episodes", "episodes_watched", "status", "score", "genres", "synopsis", "season", "year", "start_date", "end_date", "notes", "created_at", "updated_at") SELECT "id", "user_id", "title", "title_japanese", "anime_other_name", "anime_type", "airing_status", "watch_status", "website_link", "episode_on", "cover_image", "banner_image", "episodes", "episodes_watched", "status", "score", "genres", "synopsis", "season", "year", "start_date", "end_date", "notes", "created_at", "updated_at" FROM `anime`;--> statement-breakpoint
DROP TABLE `anime`;--> statement-breakpoint
ALTER TABLE `__new_anime` RENAME TO `anime`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_credentials` (
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
	`last_updated` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_credentials`("id", "user_id", "name", "category", "username", "email", "password", "url", "notes", "icon", "last_updated", "created_at") SELECT "id", "user_id", "name", "category", "username", "email", "password", "url", "notes", "icon", "last_updated", "created_at" FROM `credentials`;--> statement-breakpoint
DROP TABLE `credentials`;--> statement-breakpoint
ALTER TABLE `__new_credentials` RENAME TO `credentials`;--> statement-breakpoint
CREATE TABLE `__new_games` (
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
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_games`("id", "user_id", "title", "cover_image", "platform", "status", "hours_played", "score", "genres", "developer", "publisher", "release_date", "notes", "created_at", "updated_at") SELECT "id", "user_id", "title", "cover_image", "platform", "status", "hours_played", "score", "genres", "developer", "publisher", "release_date", "notes", "created_at", "updated_at" FROM `games`;--> statement-breakpoint
DROP TABLE `games`;--> statement-breakpoint
ALTER TABLE `__new_games` RENAME TO `games`;--> statement-breakpoint
CREATE TABLE `__new_genshin_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`uid` text NOT NULL,
	`adventure_rank` integer DEFAULT 1 NOT NULL,
	`world_level` integer DEFAULT 0 NOT NULL,
	`primogems` integer DEFAULT 0 NOT NULL,
	`intertwined` integer DEFAULT 0 NOT NULL,
	`acquaint` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_genshin_accounts`("id", "user_id", "uid", "adventure_rank", "world_level", "primogems", "intertwined", "acquaint", "created_at", "updated_at") SELECT "id", "user_id", "uid", "adventure_rank", "world_level", "primogems", "intertwined", "acquaint", "created_at", "updated_at" FROM `genshin_accounts`;--> statement-breakpoint
DROP TABLE `genshin_accounts`;--> statement-breakpoint
ALTER TABLE `__new_genshin_accounts` RENAME TO `genshin_accounts`;--> statement-breakpoint
CREATE UNIQUE INDEX `genshin_accounts_user_id_unique` ON `genshin_accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_genshin_characters` (
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
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `genshin_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_genshin_characters`("id", "account_id", "name", "element", "weapon", "rarity", "constellation", "level", "friendship", "image", "obtained", "tier", "type", "type2", "build_notes", "created_at", "updated_at") SELECT "id", "account_id", "name", "element", "weapon", "rarity", "constellation", "level", "friendship", "image", "obtained", "tier", "type", "type2", "build_notes", "created_at", "updated_at" FROM `genshin_characters`;--> statement-breakpoint
DROP TABLE `genshin_characters`;--> statement-breakpoint
ALTER TABLE `__new_genshin_characters` RENAME TO `genshin_characters`;--> statement-breakpoint
CREATE TABLE `__new_kdrama` (
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
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_kdrama`("id", "user_id", "title", "title_korean", "poster_image", "episodes", "episodes_watched", "status", "score", "genres", "synopsis", "network", "year", "cast", "notes", "created_at", "updated_at") SELECT "id", "user_id", "title", "title_korean", "poster_image", "episodes", "episodes_watched", "status", "score", "genres", "synopsis", "network", "year", "cast", "notes", "created_at", "updated_at" FROM `kdrama`;--> statement-breakpoint
DROP TABLE `kdrama`;--> statement-breakpoint
ALTER TABLE `__new_kdrama` RENAME TO `kdrama`;--> statement-breakpoint
CREATE TABLE `__new_movies` (
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
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_movies`("id", "user_id", "title", "poster_image", "backdrop_image", "release_date", "runtime", "status", "score", "genres", "synopsis", "director", "cast", "notes", "created_at", "updated_at") SELECT "id", "user_id", "title", "poster_image", "backdrop_image", "release_date", "runtime", "status", "score", "genres", "synopsis", "director", "cast", "notes", "created_at", "updated_at" FROM `movies`;--> statement-breakpoint
DROP TABLE `movies`;--> statement-breakpoint
ALTER TABLE `__new_movies` RENAME TO `movies`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`avatar` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "username", "email", "avatar", "created_at") SELECT "id", "username", "email", "avatar", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `__new_websites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`favicon` text,
	`is_favorite` integer DEFAULT false NOT NULL,
	`last_visited` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_websites`("id", "user_id", "name", "url", "category", "description", "favicon", "is_favorite", "last_visited", "created_at", "updated_at") SELECT "id", "user_id", "name", "url", "category", "description", "favicon", "is_favorite", "last_visited", "created_at", "updated_at" FROM `websites`;--> statement-breakpoint
DROP TABLE `websites`;--> statement-breakpoint
ALTER TABLE `__new_websites` RENAME TO `websites`;