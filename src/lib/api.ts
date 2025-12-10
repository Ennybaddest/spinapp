import { getUserSpinStatus, recordUserSpin } from './supabase';

export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[- ]/g, '');

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  if (cleaned.startsWith('0')) {
    return '+234' + cleaned.slice(1);
  }

  return '+234' + cleaned;
}

export interface RecordSpinRequest {
  phoneNumber: string;
  name: string;
  prize: string;
}

export interface RecordSpinResponse {
  success?: boolean;
  message?: string;
  prize?: string;
  error?: string;
  existingPrize?: string;
  statusCode: number;
}

export interface CheckSpinHistoryResponse {
  hasSpun: boolean;
  prize?: string;
  name?: string;
}

export async function checkSpinHistoryAPI(
  phoneNumber: string
): Promise<CheckSpinHistoryResponse> {
  try {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const result = await getUserSpinStatus(normalizedPhone);
    return {
      hasSpun: result.hasSpun,
      prize: result.prize,
      name: result.name,
    };
  } catch (error) {
    console.error("Error checking spin history:", error);
    return {
      hasSpun: false,
    };
  }
}

export async function recordSpinViaAPI(
  data: RecordSpinRequest
): Promise<RecordSpinResponse> {
  try {
    const normalizedPhone = normalizePhoneNumber(data.phoneNumber);
    const result = await recordUserSpin({
      phoneNumber: normalizedPhone,
      name: data.name,
      prize: data.prize,
    });

    return {
      success: result.success,
      message: result.success ? 'Spin recorded successfully' : result.error,
      prize: result.prize,
      error: result.error,
      existingPrize: result.existingPrize,
      statusCode: result.statusCode,
    };
  } catch (error) {
    console.error("Error recording spin:", error);
    return {
      error: "Failed to record spin",
      statusCode: 500,
    };
  }
}
