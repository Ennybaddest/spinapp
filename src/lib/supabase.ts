import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SpinRecord {
  name: string;
  phone: string;
  prize: string;
}

export interface UserSpinResult {
  hasSpun: boolean;
  prize?: string;
  name?: string;
}

export async function getUserSpinStatus(phone: string): Promise<UserSpinResult> {
  const { data, error } = await supabase
    .from('user_spins')
    .select('prize, name')
    .eq('phone', phone)
    .maybeSingle();

  if (error) {
    console.error('Error checking spin status:', error);
    return { hasSpun: false };
  }

  if (data) {
    return {
      hasSpun: true,
      prize: data.prize,
      name: data.name,
    };
  }

  return { hasSpun: false };
}

export async function recordSpin(data: SpinRecord) {
  try {
    const { error } = await supabase
      .from('user_spins')
      .insert([{
        phone: data.phone,
        name: data.name,
        prize: data.prize,
      }]);

    if (error) {
      console.error('Error recording spin:', error);
    }
  } catch (err) {
    console.error('Error recording spin:', err);
  }
}
