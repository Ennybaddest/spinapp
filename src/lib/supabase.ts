import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SpinRecord {
  name: string;
  phone: string;
  prize: string;
}

export async function hasUserSpun(phone: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_spins')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();

  if (error) {
    console.error('Error checking spin status:', error);
    return false;
  }

  return data !== null;
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
