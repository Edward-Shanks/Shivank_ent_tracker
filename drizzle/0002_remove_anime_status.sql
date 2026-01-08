-- Migration to remove status column from anime table and make watchStatus required
-- This migration updates the anime table to use watchStatus instead of status

-- First, update any null watchStatus values to a default value
UPDATE "anime" 
SET "watch_status" = 'Yet to Air for Watch' 
WHERE "watch_status" IS NULL;

-- Make watchStatus not null
ALTER TABLE "anime" 
  ALTER COLUMN "watch_status" SET NOT NULL;

-- Remove the status column
ALTER TABLE "anime" 
  DROP COLUMN IF EXISTS "status";

