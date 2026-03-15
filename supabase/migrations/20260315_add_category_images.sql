-- Add image column to categories table
ALTER TABLE public.categories ADD COLUMN image TEXT DEFAULT NULL;

-- Add comment for future reference
COMMENT ON COLUMN public.categories.image IS 'URL to category image for menu display';
