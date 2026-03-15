-- Add redeem_points function (equivalent to approve_order but for redemptions)
CREATE OR REPLACE FUNCTION public.redeem_points(item_id TEXT, item_name TEXT, points_to_redeem INTEGER)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_points INTEGER;
  v_order_id UUID;
BEGIN
  -- Get current user's ID and points
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get user's current reward points
  SELECT reward_points INTO v_current_points FROM public.profiles WHERE id = v_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Check if user has enough points
  IF v_current_points < points_to_redeem THEN
    RAISE EXCEPTION 'Insufficient points. Have %, need %', v_current_points, points_to_redeem;
  END IF;
  
  -- Create redemption order
  INSERT INTO public.orders (user_id, user_name, email, total_amount, status, points_earned, is_redemption)
  SELECT v_user_id, name, email, 0, 'Pending', -points_to_redeem, true
  FROM public.profiles
  WHERE id = v_user_id
  RETURNING id INTO v_order_id;
  
  -- Add redemption item to order
  INSERT INTO public.order_items (order_id, menu_item_id, name, quantity, price)
  VALUES (v_order_id, item_id, item_name, 1, 0);
  
  -- Deduct points from user profile (THIS IS THE FIX - done server-side)
  UPDATE public.profiles 
  SET reward_points = reward_points - points_to_redeem 
  WHERE id = v_user_id;
  
  RETURN v_order_id;
END;
$$;

-- Fix the UPDATE RLS policy to include WITH CHECK clause
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);
