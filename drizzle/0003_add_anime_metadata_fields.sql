ALTER TABLE "anime" ADD COLUMN IF NOT EXISTS "media_type" text;
ALTER TABLE "anime" ADD COLUMN IF NOT EXISTS "producers" text;
ALTER TABLE "anime" ADD COLUMN IF NOT EXISTS "source" text;

