-- Function to fetch current user's profile (bypasses RLS issues)
CREATE OR REPLACE FUNCTION public.fetch_current_user_profile()
RETURNS TABLE (id UUID, name TEXT, email TEXT, reward_points INTEGER, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.email, p.reward_points, p.created_at
  FROM public.profiles p
  WHERE p.id = auth.uid();
END;
$$;

-- Function to fetch all orders (for current user or all for admins)
CREATE OR REPLACE FUNCTION public.fetch_user_orders()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name TEXT,
  email TEXT,
  total_amount INTEGER,
  status TEXT,
  points_earned INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    -- Admins see all orders
    RETURN QUERY
    SELECT o.id, o.user_id, o.user_name, o.email, o.total_amount, o.status, o.points_earned, o.created_at
    FROM public.orders o
    ORDER BY o.created_at DESC;
  ELSE
    -- Users see only their orders
    RETURN QUERY
    SELECT o.id, o.user_id, o.user_name, o.email, o.total_amount, o.status, o.points_earned, o.created_at
    FROM public.orders o
    WHERE o.user_id = auth.uid()
    ORDER BY o.created_at DESC;
  END IF;
END;
$$;

-- Function to fetch order items for given order IDs
CREATE OR REPLACE FUNCTION public.fetch_order_items(order_ids UUID[])
RETURNS TABLE (
  id UUID,
  order_id UUID,
  menu_item_id TEXT,
  name TEXT,
  quantity INTEGER,
  price INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT oi.id, oi.order_id, oi.menu_item_id, oi.name, oi.quantity, oi.price
  FROM public.order_items oi
  WHERE oi.order_id = ANY(order_ids);
END;
$$;

-- Function to fetch all users (admins only)
CREATE OR REPLACE FUNCTION public.fetch_all_users()
RETURNS TABLE (id UUID, name TEXT, email TEXT, reward_points INTEGER, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  RETURN QUERY
  SELECT p.id, p.name, p.email, p.reward_points, p.created_at
  FROM public.profiles p;
END;
$$;
