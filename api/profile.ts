import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../utils/supabase';
import { verifyAuthToken, getAuthToken } from '../utils/auth';

export default async (req: VercelRequest, res: VercelResponse) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get auth token from header
    const token = getAuthToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No authorization token' });
    }

    // Verify token and get user ID
    const { userId, error: authError } = await verifyAuthToken(token);
    if (authError) {
      return res.status(401).json({ error: authError });
    }

    // Fetch user profile from database (service role bypasses RLS)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(200).json({
      id: data.id,
      name: data.name,
      email: data.email,
      reward_points: data.reward_points,
      created_at: data.created_at,
    });
  } catch (err) {
    console.error('Profile endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
