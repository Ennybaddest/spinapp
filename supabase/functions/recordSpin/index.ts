import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RecordSpinRequest {
  phoneNumber: string;
  name: string;
  prize: string;
}

interface ErrorResponse {
  error: string;
  existingPrize?: string;
  statusCode: number;
}

interface SuccessResponse {
  success: true;
  message: string;
  prize: string;
}

async function recordSpin(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
        statusCode: 405,
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const body: RecordSpinRequest = await req.json();

    if (!body.phoneNumber || !body.name || !body.prize) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: phoneNumber, name, prize",
          statusCode: 400,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({
          error: "Server configuration error",
          statusCode: 500,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: existingRecord, error: checkError } = await supabase
      .from("user_spins")
      .select("prize")
      .eq("phone", body.phoneNumber)
      .maybeSingle();

    if (checkError) {
      console.error("Database check error:", checkError);
      return new Response(
        JSON.stringify({
          error: "Failed to check spin history",
          statusCode: 500,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (existingRecord) {
      return new Response(
        JSON.stringify({
          error: "This phone number has already spun the wheel",
          existingPrize: existingRecord.prize,
          statusCode: 409,
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { error: insertError } = await supabase
      .from("user_spins")
      .insert([
        {
          phone: body.phoneNumber,
          name: body.name,
          prize: body.prize,
        },
      ]);

    if (insertError) {
      console.error("Database insert error:", insertError);

      if (insertError.code === "23505") {
        const { data: conflictRecord } = await supabase
          .from("user_spins")
          .select("prize")
          .eq("phone", body.phoneNumber)
          .maybeSingle();

        return new Response(
          JSON.stringify({
            error: "This phone number has already spun the wheel",
            existingPrize: conflictRecord?.prize,
            statusCode: 409,
          }),
          {
            status: 409,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: "Failed to record spin",
          statusCode: 500,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const successResponse: SuccessResponse = {
      success: true,
      message: "Spin recorded successfully",
      prize: body.prize,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 201,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        statusCode: 500,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}

Deno.serve(recordSpin);
