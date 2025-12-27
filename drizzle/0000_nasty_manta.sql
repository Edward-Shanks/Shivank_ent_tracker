CREATE TABLE "anime" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"title_japanese" text,
	"anime_other_name" text,
	"anime_type" text,
	"airing_status" text,
	"watch_status" text,
	"website_link" text,
	"episode_on" text,
	"cover_image" text NOT NULL,
	"banner_image" text,
	"episodes" integer DEFAULT 0 NOT NULL,
	"episodes_watched" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"score" integer,
	"genres" text DEFAULT '[]' NOT NULL,
	"synopsis" text,
	"season" text,
	"year" integer,
	"start_date" text,
	"end_date" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"username" text,
	"email" text,
	"password" text NOT NULL,
	"url" text,
	"notes" text,
	"icon" text,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"cover_image" text NOT NULL,
	"platform" text DEFAULT '[]' NOT NULL,
	"status" text NOT NULL,
	"hours_played" real DEFAULT 0 NOT NULL,
	"score" integer,
	"genres" text DEFAULT '[]' NOT NULL,
	"developer" text,
	"publisher" text,
	"release_date" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genshin_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"uid" text NOT NULL,
	"adventure_rank" integer DEFAULT 1 NOT NULL,
	"world_level" integer DEFAULT 0 NOT NULL,
	"primogems" integer DEFAULT 0 NOT NULL,
	"intertwined" integer DEFAULT 0 NOT NULL,
	"acquaint" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "genshin_accounts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "genshin_characters" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"name" text NOT NULL,
	"element" text NOT NULL,
	"weapon" text NOT NULL,
	"rarity" integer NOT NULL,
	"constellation" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"friendship" integer DEFAULT 0 NOT NULL,
	"image" text NOT NULL,
	"obtained" boolean DEFAULT true NOT NULL,
	"tier" text,
	"type" text,
	"type2" text,
	"build_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kdrama" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"title_korean" text,
	"poster_image" text NOT NULL,
	"episodes" integer DEFAULT 0 NOT NULL,
	"episodes_watched" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"score" integer,
	"genres" text DEFAULT '[]' NOT NULL,
	"synopsis" text,
	"network" text,
	"year" integer,
	"cast" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"poster_image" text NOT NULL,
	"backdrop_image" text,
	"release_date" text NOT NULL,
	"runtime" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"score" integer,
	"genres" text DEFAULT '[]' NOT NULL,
	"synopsis" text,
	"director" text,
	"cast" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"avatar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "websites" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"favicon" text,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"last_visited" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "anime" ADD CONSTRAINT "anime_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genshin_accounts" ADD CONSTRAINT "genshin_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genshin_characters" ADD CONSTRAINT "genshin_characters_account_id_genshin_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."genshin_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kdrama" ADD CONSTRAINT "kdrama_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;