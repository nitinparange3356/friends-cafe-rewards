-- Add phone_number column to profiles table
ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;

-- Create unique index on phone_number (allow NULL values)
CREATE UNIQUE INDEX idx_phone_number_unique ON public.profiles (phone_number) WHERE phone_number IS NOT NULL;
