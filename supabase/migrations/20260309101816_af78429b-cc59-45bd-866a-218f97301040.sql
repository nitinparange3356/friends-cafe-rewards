
-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  reward_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Service can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT TO anon USING (true);

-- Admin role
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Menu items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  actual_price INTEGER NOT NULL,
  offer INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  veg_type TEXT NOT NULL DEFAULT 'veg',
  image TEXT NOT NULL DEFAULT '',
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage menu items" ON public.menu_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  email TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own order items" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert own order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can read all order items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Offers table
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  discount_percent INTEGER NOT NULL DEFAULT 0,
  code TEXT NOT NULL DEFAULT '',
  valid_until TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Admins can manage offers" ON public.offers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to approve order and award points (admin only)
CREATE OR REPLACE FUNCTION public.approve_order(order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_user_id UUID;
  v_points INTEGER;
BEGIN
  -- Check admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT total_amount, user_id INTO v_total, v_user_id FROM public.orders WHERE id = order_id AND status = 'Pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or not pending';
  END IF;

  -- 1 point for every 2 rupees spent
  v_points := FLOOR(v_total::NUMERIC / 2);

  UPDATE public.orders SET status = 'Approved', points_earned = v_points WHERE id = order_id;
  UPDATE public.profiles SET reward_points = reward_points + v_points WHERE id = v_user_id;
END;
$$;

-- Function to reject order (admin only)
CREATE OR REPLACE FUNCTION public.reject_order(order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.orders SET status = 'Rejected' WHERE id = order_id AND status = 'Pending';
END;
$$;

-- Function to adjust user points (admin only)
CREATE OR REPLACE FUNCTION public.adjust_points(target_user_id UUID, adjustment INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.profiles SET reward_points = GREATEST(0, reward_points + adjustment) WHERE id = target_user_id;
END;
$$;

-- Seed default categories
INSERT INTO public.categories (name, sort_order) VALUES
  ('Coffee', 1), ('Burgers', 2), ('Snacks', 3), ('Combos', 4), ('Desserts', 5), ('Drinks', 6);

-- Seed default menu items
INSERT INTO public.menu_items (name, description, price, actual_price, offer, category, veg_type, image, available) VALUES
  ('Cappuccino', 'Rich espresso with steamed milk foam and a hint of cocoa', 149, 199, 25, 'Coffee', 'veg', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', true),
  ('Cold Brew', 'Smooth, slow-steeped cold coffee served over ice', 179, 229, 22, 'Coffee', 'veg', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', true),
  ('Caramel Latte', 'Espresso blended with steamed milk and sweet caramel drizzle', 199, 249, 20, 'Coffee', 'veg', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop', true),
  ('Mocha Frappe', 'Blended iced coffee with chocolate and whipped cream', 229, 279, 18, 'Coffee', 'veg', 'https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=400&h=300&fit=crop', true),
  ('Classic Chicken Burger', 'Juicy grilled chicken patty with fresh lettuce and special sauce', 179, 229, 22, 'Burgers', 'non-veg', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', true),
  ('Veggie Burger', 'Crispy veggie patty with cheese, onions, and tangy mayo', 149, 189, 21, 'Burgers', 'veg', 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop', true),
  ('Egg Burger', 'Double egg patty with cheese slice and pickled jalapeños', 159, 199, 20, 'Burgers', 'egg', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop', true),
  ('French Fries', 'Crispy golden fries seasoned with herbs and spices', 99, 129, 23, 'Snacks', 'veg', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop', true),
  ('Chicken Wings', 'Spicy buffalo wings with blue cheese dip', 249, 299, 17, 'Snacks', 'non-veg', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop', true),
  ('Paneer Tikka', 'Grilled cottage cheese marinated in aromatic spices', 199, 249, 20, 'Snacks', 'veg', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop', true),
  ('Burger + Fries + Drink', 'Classic chicken burger with fries and a cold drink', 299, 399, 25, 'Combos', 'non-veg', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop', true),
  ('Coffee + Dessert Combo', 'Any cappuccino with a slice of chocolate cake', 249, 349, 29, 'Combos', 'veg', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop', true),
  ('Chocolate Brownie', 'Warm fudgy brownie topped with vanilla ice cream', 179, 229, 22, 'Desserts', 'veg', 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=300&fit=crop', true),
  ('Cheesecake', 'New York style creamy cheesecake with berry compote', 219, 279, 22, 'Desserts', 'veg', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop', true),
  ('Fresh Lime Soda', 'Refreshing lime soda with mint leaves', 79, 99, 20, 'Drinks', 'veg', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=400&h=300&fit=crop', true),
  ('Mango Smoothie', 'Thick and creamy mango smoothie blended with yogurt', 149, 189, 21, 'Drinks', 'veg', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop', true),
  ('Iced Tea', 'Chilled peach iced tea with a hint of lemon', 99, 129, 23, 'Drinks', 'veg', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop', true);
