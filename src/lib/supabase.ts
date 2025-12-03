import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export interface RecordSpinParams {
  phoneNumber: string;
  name: string;
  prize: string;
}

export interface RecordSpinResult {
  success: boolean;
  statusCode: number;
  error?: string;
  existingPrize?: string;
  prize?: string;
}

export async function recordUserSpin(params: RecordSpinParams): Promise<RecordSpinResult> {
  try {
    const { phoneNumber, name, prize } = params;

    const { data: existingRecord, error: checkError } = await supabase
      .from('user_spins')
      .select('prize')
      .eq('phone', phoneNumber)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing spin:', checkError);
      return {
        success: false,
        statusCode: 500,
        error: 'Failed to check spin history',
      };
    }

    if (existingRecord) {
      return {
        success: false,
        statusCode: 409,
        error: 'Already spun',
        existingPrize: existingRecord.prize,
      };
    }

    const { data, error: insertError } = await supabase
      .from('user_spins')
      .insert([
        {
          phone: phoneNumber,
          name: name,
          prize: prize,
        },
      ])
      .select();

    if (insertError) {
      console.error('Error recording spin:', insertError);
      if (insertError.code === '23505') {
        const { data: conflictRecord } = await supabase
          .from('user_spins')
          .select('prize')
          .eq('phone', phoneNumber)
          .maybeSingle();

        return {
          success: false,
          statusCode: 409,
          error: 'Already spun',
          existingPrize: conflictRecord?.prize,
        };
      }
      return {
        success: false,
        statusCode: 500,
        error: 'Failed to record spin',
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        statusCode: 500,
        error: 'Failed to verify spin recording',
      };
    }

    return {
      success: true,
      statusCode: 201,
      prize: prize,
    };
  } catch (err) {
    console.error('Unexpected error recording spin:', err);
    return {
      success: false,
      statusCode: 500,
      error: 'Internal server error',
    };
  }
}
