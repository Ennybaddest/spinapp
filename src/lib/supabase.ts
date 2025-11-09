import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SpinRecord {
  name: string;
  phone: string;
  prize: string;
}

export async function recordSpin(data: SpinRecord) {
  const { error } = await supabase
    .from('spins')
    .insert([data]);

  if (error) {
    console.error('Error recording spin:', error);
  }
}
