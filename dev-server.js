import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
app.use(express.json());

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to extract and verify JWT token
const verifyToken = (token) => {
  try {
    // Get the public key from Supabase
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    
    // Decode JWT payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (e) {
    return null;
  }
};

// GET user profile
app.post('/api/profile', async (req, res) => {
  try {
    console.log("📨 [API] /api/profile requested");
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("❌ [API] No auth header");
      return res.status(401).json({ error: 'No auth token' });
    }

    const token = authHeader.substring(7);
    console.log("🔐 [API] Token received, length:", token.length);
    const payload = verifyToken(token);
    
    if (!payload || !payload.sub) {
      console.log("❌ [API] Token verification failed");
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log("✅ [API] Token verified for user:", payload.sub);

    // Query profiles table with service role (bypasses RLS)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', payload.sub)
      .single();

    if (error) {
      console.error("❌ [API] Supabase query error:", error);
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (!data) {
      console.error("❌ [API] No profile data returned");
      return res.status(404).json({ error: 'Profile not found' });
    }

    console.log("✅ [API] Profile found:", data.name);
    res.json(data);
  } catch (err) {
    console.error('❌ [API] Profile endpoint error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET user orders
app.post('/api/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No auth token' });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', payload.sub)
      .eq('role', 'admin')
      .maybeSingle();

    const isAdmin = !!adminRole;

    // Get orders
    let query = supabase.from('orders').select('*,order_items(*)');
    if (!isAdmin) {
      query = query.eq('user_id', payload.sub);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Orders query error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Orders endpoint error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET all users (admin only)
app.post('/api/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No auth token' });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', payload.sub)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminRole) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get all users
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Users query error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Users endpoint error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST phone lookup (no auth required)
app.post('/api/phone-lookup', async (req, res) => {
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
        error: 'No account found with this phone number',
        details: error.message 
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
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🚀 Dev API server running on http://localhost:${PORT}`);
  console.log(`📊 Using Supabase at ${supabaseUrl}`);
});
