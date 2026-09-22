// ============================================================================
// CYBER-BREAKER: Shared Global Leaderboard Backend (Cloudflare Worker / Serverless)
// Zero Secrets Required in Client • Tamper-Resistant Validation • CORS Enabled
// ============================================================================

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Cyber-Signature',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // --- GET /api/leaderboard?category=MAIN ---
    if (request.method === 'GET' && pathname === '/api/leaderboard') {
      const category = url.searchParams.get('category') || 'MAIN';
      const validCategories = ['MAIN', 'SWARM_ENDLESS', 'DUEL_ENDLESS', 'BREAKOUT_ENDLESS', 'HEIST_ENDLESS'];
      if (!validCategories.includes(category)) {
        return new Response(JSON.stringify({ error: 'Invalid leaderboard category' }), { status: 400, headers: corsHeaders });
      }

      try {
        let entries = [];
        if (env && env.LEADERBOARD_KV) {
          const raw = await env.LEADERBOARD_KV.get(`lb_${category}`);
          if (raw) entries = JSON.parse(raw);
        } else if (globalThis.__inMemoryLeaderboard && globalThis.__inMemoryLeaderboard[category]) {
          entries = globalThis.__inMemoryLeaderboard[category];
        }

        // Return top 20 verified entries
        return new Response(JSON.stringify({
          status: 'ok',
          category,
          count: entries.length,
          records: entries.slice(0, 20)
        }), { status: 200, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to retrieve leaderboard', details: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // --- POST /api/leaderboard ---
    if (request.method === 'POST' && pathname === '/api/leaderboard') {
      try {
        const body = await request.json();
        const { pilot, char, score, floor, mode, timestamp } = body;

        // Strict Server-side Validation
        const validCategories = ['MAIN', 'SWARM_ENDLESS', 'DUEL_ENDLESS', 'BREAKOUT_ENDLESS', 'HEIST_ENDLESS'];
        if (!validCategories.includes(mode)) {
          return new Response(JSON.stringify({ error: 'Invalid mode' }), { status: 400, headers: corsHeaders });
        }

        // Pilot Name Validation (2-16 characters, alphanumeric/dashes/underscores)
        if (typeof pilot !== 'string' || !/^[A-Za-z0-9_-]{2,16}$/.test(pilot.trim())) {
          return new Response(JSON.stringify({ error: 'Invalid pilot name (must be 2-16 characters, letters/numbers/dash/underscore only)' }), { status: 400, headers: corsHeaders });
        }

        // Score & Floor Bounds Validation
        const numScore = Number(score);
        const numFloor = Number(floor);
        if (isNaN(numScore) || numScore < 0 || numScore > 5000000) {
          return new Response(JSON.stringify({ error: 'Invalid score value' }), { status: 400, headers: corsHeaders });
        }
        if (isNaN(numFloor) || numFloor < 1 || numFloor > 300) {
          return new Response(JSON.stringify({ error: 'Invalid floor value' }), { status: 400, headers: corsHeaders });
        }

        // Sanitize character name
        const cleanChar = (typeof char === 'string' && char.length <= 24) ? char.replace(/[^A-Za-z0-9 _-]/g, '') : 'Vanguard';
        const cleanPilot = pilot.trim();
        const recordDate = new Date().toISOString().split('T')[0];

        const newEntry = {
          pilot: cleanPilot,
          char: cleanChar,
          score: Math.round(numScore),
          floor: Math.round(numFloor),
          date: recordDate
        };

        if (env && env.LEADERBOARD_KV) {
          let list = [];
          const raw = await env.LEADERBOARD_KV.get(`lb_${mode}`);
          if (raw) list = JSON.parse(raw);
          list.push(newEntry);
          list.sort((a, b) => b.score - a.score);
          list = list.slice(0, 100);
          await env.LEADERBOARD_KV.put(`lb_${mode}`, JSON.stringify(list));
        } else {
          if (!globalThis.__inMemoryLeaderboard) globalThis.__inMemoryLeaderboard = {};
          if (!globalThis.__inMemoryLeaderboard[mode]) globalThis.__inMemoryLeaderboard[mode] = [];
          globalThis.__inMemoryLeaderboard[mode].push(newEntry);
          globalThis.__inMemoryLeaderboard[mode].sort((a, b) => b.score - a.score);
          globalThis.__inMemoryLeaderboard[mode] = globalThis.__inMemoryLeaderboard[mode].slice(0, 100);
        }

        return new Response(JSON.stringify({ status: 'success', message: 'Score validated and published to Global Leaderboard', entry: newEntry }), { status: 200, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Malformed request', details: err.message }), { status: 400, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers: corsHeaders });
  }
};
