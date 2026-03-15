-- Add is_redemption column to orders table
ALTER TABLE public.orders ADD COLUMN is_redemption BOOLEAN NOT NULL DEFAULT false;
