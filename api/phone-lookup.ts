import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../utils/supabase';

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({ error: 'phone_number is required' });
    }

    // Normalize the phone number - remove all non-digits, keep last 10
    let searchPhone = phone_number.replace(/\D/g, '');
    if (searchPhone.length > 10) {
      searchPhone = searchPhone.slice(-10);
    }

    // Query as service role (has full access, bypasses RLS)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('email, phone_number')
      .eq('phone_number', searchPhone)
      .single();

    if (error) {
      console.error('Phone lookup error:', error);
      return res.status(400).json({ 
        error: 'No account found with this phone number'
      });
    }

    if (!profiles) {
      return res.status(404).json({ error: 'No account found with this phone number' });
    }

    res.json({ email: profiles.email });
  } catch (err) {
    console.error('Phone lookup endpoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
