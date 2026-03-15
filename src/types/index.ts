export type VegType = "veg" | "non-veg" | "egg";

// Categories are now dynamic strings managed by admin
export type MenuCategory = string;

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  actual_price: number;
  offer: number;
  category: MenuCategory;
  veg_type: VegType;
  image: string;
  available: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  user_name: string;
  email: string;
  items: OrderItem[];
  order_items?: OrderItem[];
  total_amount: number;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
  points_earned: number;
  is_redemption?: boolean;
}

export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone_number?: string | null;
  reward_points: number;
  created_at: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percent: number;
  code: string;
  valid_until: string;
  image: string;
  active: boolean;
}
