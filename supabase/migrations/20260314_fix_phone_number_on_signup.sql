-- Fix phone_number handling on signup with consistent normalization
-- Update the handle_new_user trigger to properly capture phone_number from auth metadata
-- Normalize all phone numbers to digits only for consistent lookup

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone TEXT;
BEGIN
  -- Extract phone from metadata
  v_phone := NULLIF(NEW.raw_user_meta_data->>'phone_number', '');
  
  -- Normalize: remove all non-digits, keep only last 10 digits for Indian format
  IF v_phone IS NOT NULL THEN
    v_phone := regexp_replace(v_phone, '[^0-9]', '', 'g');
    IF length(v_phone) > 10 THEN
      v_phone := RIGHT(v_phone, 10);
    END IF;
    IF v_phone = '' THEN
      v_phone := NULL;
    END IF;
  END IF;
  
  INSERT INTO public.profiles (id, name, email, phone_number)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', ''), 
    NEW.email,
    v_phone
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing profiles that have NULL phone_number from auth metadata
-- This handles users who already signed up before this fix
CREATE OR REPLACE FUNCTION public.update_existing_user_phone_numbers()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone TEXT;
BEGIN
  UPDATE public.profiles p
  SET phone_number = (
    CASE 
      WHEN u.raw_user_meta_data->>'phone_number' IS NULL THEN NULL
      WHEN trim(u.raw_user_meta_data->>'phone_number') = '' THEN NULL
      ELSE 
        CASE 
          WHEN length(regexp_replace(u.raw_user_meta_data->>'phone_number', '[^0-9]', '', 'g')) > 10
            THEN RIGHT(regexp_replace(u.raw_user_meta_data->>'phone_number', '[^0-9]', '', 'g'), 10)
          ELSE regexp_replace(u.raw_user_meta_data->>'phone_number', '[^0-9]', '', 'g')
        END
    END
  )
  FROM auth.users u
  WHERE p.id = u.id
    AND p.phone_number IS NULL
    AND u.raw_user_meta_data->>'phone_number' IS NOT NULL
    AND TRIM(u.raw_user_meta_data->>'phone_number') != '';
END;
$$;

-- Execute the update
SELECT update_existing_user_phone_numbers();

-- Drop the temporary function
DROP FUNCTION IF EXISTS public.update_existing_user_phone_numbers();
