import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Fetches ICY/SHOUTcast v2 metadata from a stream URL.
 * SHOUTcast v2 exposes JSON stats at /stats?json=1
 * Also tries /currentsong for simpler endpoints.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { stream_url } = await req.json();

    if (!stream_url) {
      return new Response(JSON.stringify({ error: "stream_url required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract base URL (remove path/query, keep host:port)
    const url = new URL(stream_url);
    const baseUrl = `${url.protocol}//${url.host}`;

    let title = "";
    let artist = "";

    // Try SHOUTcast v2 JSON stats endpoint
    try {
      const statsUrl = `${baseUrl}/stats?json=1`;
      const res = await fetch(statsUrl, {
        headers: { "User-Agent": "RadioTVG/1.0" },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        const songTitle = data.songtitle || data.title || "";
        
        // SHOUTcast typically returns "Artist - Title" format
        if (songTitle.includes(" - ")) {
          const parts = songTitle.split(" - ");
          artist = parts[0].trim();
          title = parts.slice(1).join(" - ").trim();
        } else {
          title = songTitle;
        }

        return new Response(
          JSON.stringify({ title, artist, raw: songTitle }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      // stats endpoint failed, try next method
    }

    // Try /currentsong endpoint (common in SHOUTcast/Icecast)
    try {
      const currentSongUrl = `${baseUrl}/currentsong`;
      const res = await fetch(currentSongUrl, {
        headers: { "User-Agent": "RadioTVG/1.0" },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const songTitle = (await res.text()).trim();
        
        if (songTitle && songTitle.includes(" - ")) {
          const parts = songTitle.split(" - ");
          artist = parts[0].trim();
          title = parts.slice(1).join(" - ").trim();
        } else if (songTitle) {
          title = songTitle;
        }

        return new Response(
          JSON.stringify({ title, artist, raw: songTitle }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      // currentsong endpoint failed too
    }

    // Try Icecast JSON status endpoint
    try {
      const icecastUrl = `${baseUrl}/status-json.xsl`;
      const res = await fetch(icecastUrl, {
        headers: { "User-Agent": "RadioTVG/1.0" },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        const source = data.icestats?.source;
        const src = Array.isArray(source) ? source[0] : source;

        if (src) {
          const songTitle = src.title || src.yp_currently_playing || "";
          if (songTitle.includes(" - ")) {
            const parts = songTitle.split(" - ");
            artist = parts[0].trim();
            title = parts.slice(1).join(" - ").trim();
          } else {
            title = songTitle;
          }

          return new Response(
            JSON.stringify({ title, artist, raw: songTitle }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    } catch {
      // Icecast endpoint failed
    }

    // No metadata found
    return new Response(
      JSON.stringify({ title: "", artist: "", raw: "" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
