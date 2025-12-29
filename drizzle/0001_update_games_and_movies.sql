-- Migration to update games and movies tables
-- Add new columns and remove old ones

-- Update games table
ALTER TABLE "games" 
  ADD COLUMN IF NOT EXISTS "game_type" text,
  ADD COLUMN IF NOT EXISTS "download_url" text;

-- Remove old columns from games table (if they exist)
ALTER TABLE "games" 
  DROP COLUMN IF EXISTS "hours_played",
  DROP COLUMN IF EXISTS "developer",
  DROP COLUMN IF EXISTS "publisher";

-- Update movies table
ALTER TABLE "movies" 
  ADD COLUMN IF NOT EXISTS "review_type" text;

-- Remove old columns from movies table (if they exist)
ALTER TABLE "movies" 
  DROP COLUMN IF EXISTS "runtime",
  DROP COLUMN IF EXISTS "director",
  DROP COLUMN IF EXISTS "cast";

