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

export async function recordSpinViaAPI(
  data: RecordSpinRequest
): Promise<RecordSpinResponse> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recordSpin`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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
