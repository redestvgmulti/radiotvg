import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Not authenticated");

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

    const url = new URL(req.url);
    const method = req.method;

    if (method === "GET") {
      // List all users with roles
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;

      const { data: roles } = await supabaseAdmin.from("user_roles").select("*");

      const usersWithRoles = users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        roles: (roles || []).filter((r) => r.user_id === u.id).map((r) => r.role),
      }));

      return new Response(JSON.stringify(usersWithRoles), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "POST") {
      const body = await req.json();
      const { action } = body;

      if (action === "create_user") {
        const { email, password, role } = body;
        if (!email || !password) throw new Error("Email and password required");

        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (createErr) throw createErr;

        if (role) {
          await supabaseAdmin.from("user_roles").insert({
            user_id: newUser.user.id,
            role,
          });
        }

        return new Response(JSON.stringify({ message: "User created", userId: newUser.user.id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "set_role") {
        const { user_id, role } = body;
        if (!user_id || !role) throw new Error("user_id and role required");

        // Prevent removing own admin
        if (user_id === user.id) throw new Error("Cannot change your own role");

        // Remove existing roles
        await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);

        // Add new role
        await supabaseAdmin.from("user_roles").insert({ user_id, role });

        return new Response(JSON.stringify({ message: "Role updated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "delete_user") {
        const { user_id } = body;
        if (!user_id) throw new Error("user_id required");
        if (user_id === user.id) throw new Error("Cannot delete yourself");

        const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(user_id);
        if (delErr) throw delErr;

        return new Response(JSON.stringify({ message: "User deleted" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error("Unknown action");
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
