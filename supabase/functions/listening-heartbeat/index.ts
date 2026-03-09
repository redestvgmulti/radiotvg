import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user from JWT
    const token = authHeader.replace('Bearer ', '');
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { station_id } = await req.json();

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_listening_minutes, total_points')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const newMinutes = profile.total_listening_minutes + 1;
    let pointsToAdd = 0;

    // Every 60 minutes = 10 points
    const previousHours = Math.floor(profile.total_listening_minutes / 60);
    const newHours = Math.floor(newMinutes / 60);

    if (newHours > previousHours) {
      pointsToAdd = 10;

      // Check for active boosters
      const now = new Date().toISOString();
      const { data: boosters } = await supabase
        .from('boosters')
        .select('multiplier')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);

      if (boosters && boosters.length > 0) {
        // Use highest multiplier
        const maxMultiplier = Math.max(...boosters.map(b => Number(b.multiplier)));
        pointsToAdd = Math.round(pointsToAdd * maxMultiplier);
      }
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        total_listening_minutes: newMinutes,
        total_points: profile.total_points + pointsToAdd,
      })
      .eq('user_id', user.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      total_listening_minutes: newMinutes,
      total_points: profile.total_points + pointsToAdd,
      points_awarded: pointsToAdd,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
