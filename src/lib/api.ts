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
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/checkSpin?phoneNumber=${encodeURIComponent(phoneNumber)}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData: CheckSpinHistoryResponse = await response.json();

    return responseData;
  } catch (error) {
    console.error("Error calling checkSpin API:", error);
    return {
      hasSpun: false,
    };
  }
}

export async function recordSpinViaAPI(
  data: RecordSpinRequest
): Promise<RecordSpinResponse> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recordSpin`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData: RecordSpinResponse = await response.json();

    return {
      ...responseData,
      statusCode: response.status,
    };
  } catch (error) {
    console.error("Error calling recordSpin API:", error);
    return {
      error: "Failed to connect to server",
      statusCode: 500,
    };
  }
}
