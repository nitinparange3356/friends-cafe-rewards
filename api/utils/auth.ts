import { VerifyJwtResponse } from '@supabase/supabase-js';
import { supabase } from './supabase.js';

export async function verifyAuthToken(token: string): Promise<{ userId: string; error?: string }> {
  try {
    // Verify the JWT token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return { userId: '', error: 'Unauthorized' };
    }
    
    return { userId: data.user.id };
  } catch (err) {
    return { userId: '', error: 'Token verification failed' };
  }
}

export function getAuthToken(req: any): string | null {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  
  // Extract token from "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  
  return null;
}
