import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ONESIGNAL_APP_ID = "7672f743-8b3c-4ac3-9c72-343e0caf660b";
    const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (!ONESIGNAL_REST_API_KEY) {
      throw new Error("ONESIGNAL_REST_API_KEY not configured");
    }

    const response = await fetch(`https://onesignal.com/api/v1/apps/${ONESIGNAL_APP_ID}`, {
      method: "GET",
      headers: {
        "Authorization": `Key ${ONESIGNAL_REST_API_KEY}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.errors?.[0] || "Failed to fetch stats from OneSignal");
    }

    // result.messageable_players usually represents subscribed users
    return new Response(
      JSON.stringify({
        total_subscribers: result.messageable_players || 0,
        // OneSignal free tier doesn't expose exact count for default active/inactive segments via API unfortunately.
        // We return arbitrary placeholders, or we can just send null to hide it on UI.
        active_subscribers: null, 
        inactive_subscribers: null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
