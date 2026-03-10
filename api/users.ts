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

    if (!adminCheck) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Fetch all users
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Users fetch error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(
      users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        reward_points: u.reward_points,
        created_at: u.created_at,
      }))
    );
  } catch (err) {
    console.error('Users endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
