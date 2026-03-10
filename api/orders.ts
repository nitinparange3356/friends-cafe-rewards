import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../utils/supabase';
import { verifyAuthToken, getAuthToken } from '../utils/auth';

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify auth
    const token = getAuthToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No authorization token' });
    }

    const { userId, error: authError } = await verifyAuthToken(token);
    if (authError) {
      return res.status(401).json({ error: authError });
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    const isAdmin = !!adminCheck;

    // Fetch orders (admins see all, users see only theirs)
    let ordersQuery = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!isAdmin) {
      ordersQuery = ordersQuery.eq('user_id', userId);
    }

    const { data: ordersData, error: ordersError } = await ordersQuery;
    if (ordersError) {
      console.error('Orders fetch error:', ordersError);
      return res.status(400).json({ error: ordersError.message });
    }

    if (!ordersData || ordersData.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch order items
    const orderIds = ordersData.map(o => o.id);
    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    // Map orders with items
    const mapped = ordersData.map(o => ({
      id: o.id,
      user_id: o.user_id,
      user_name: o.user_name,
      email: o.email,
      total_amount: o.total_amount,
      status: o.status,
      points_earned: o.points_earned,
      created_at: o.created_at,
      items: (itemsData || [])
        .filter(i => i.order_id === o.id)
        .map(i => ({
          menu_item_id: i.menu_item_id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
    }));

    return res.status(200).json(mapped);
  } catch (err) {
    console.error('Orders endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
