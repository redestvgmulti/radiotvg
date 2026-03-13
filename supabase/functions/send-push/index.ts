import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    const { data: callerRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!callerRole) throw new Error("Unauthorized: admin only");

    const body = await req.json();
    const { title, message, icon_url, image_url, link_url, target } = body;

    if (!title || !message) {
      throw new Error("Title and message are required");
    }

    const ONESIGNAL_APP_ID = "7672f743-8b3c-4ac3-9c72-343e0caf660b";
    const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (!ONESIGNAL_REST_API_KEY) {
      throw new Error("ONESIGNAL_REST_API_KEY not configured");
    }

    const payload: Record<string, any> = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
    };

    if (target === "all" || !target) {
      payload.included_segments = ["Subscribed Users"];
    } else if (target === "active") {
      payload.included_segments = ["Active Users"];
    } else if (target === "inactive") {
      payload.included_segments = ["Inactive Users"];
    }

    if (icon_url) {
      payload.chrome_web_icon = icon_url;
      payload.firefox_icon = icon_url;
      payload.small_icon = icon_url;
      payload.large_icon = icon_url;
    }

    if (image_url) {
      payload.chrome_web_image = image_url;
      payload.big_picture = image_url;
    }

    if (link_url) {
      payload.url = link_url;
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    let status = "sent";
    let errorMessage = "";

    if (!response.ok) {
      status = "failed";
      errorMessage = result.errors?.[0] || JSON.stringify(result);
    }

    // Log to push_history
    await supabaseAdmin.from("push_history").insert({
      title,
      message,
      target: target || "all",
      recipients: result.recipients || 0,
      status,
      onesignal_id: result.id || null,
      icon_url: icon_url || "",
      image_url: image_url || "",
      link_url: link_url || "",
      sent_by: user.id,
    });

    if (status === "failed") {
      throw new Error(errorMessage);
    }

    return new Response(
      JSON.stringify({
        success: true,
        recipients: result.recipients || 0,
        id: result.id,
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
