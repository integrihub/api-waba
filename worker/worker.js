let Q = [], paused = false, sent = 0, failed = 0;

/* ===== TRAFFIC CONTROL ===== */
let trafficCounter = 0;
let trafficWindow = Date.now();

function isHighTraffic() {
  const now = Date.now();
  if (now - trafficWindow > 60000) {
    trafficWindow = now;
    trafficCounter = 0;
  }
  trafficCounter++;
  return trafficCounter > 50;
}

/* ===== CORS ===== */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /* ===== PREFLIGHT ===== */
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    /* ===== LOGIN ===== */
    if (url.pathname === "/login" && request.method === "POST") {
      const body = await request.json();
      const ok =
        body.username === env.ADMIN_USER &&
        body.password === env.ADMIN_PASS;

      return new Response(JSON.stringify({ ok }), {
        status: ok ? 200 : 401,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    /* ===== BLAST UPLOAD ===== */
    if (url.pathname === "/blast/upload" && request.method === "POST") {
      const b = await request.json();
      Q = b.csv.split("\n").slice(1);
      sent = failed = 0;
      paused = false;
      process(env, b.template);
      return new Response("OK", { headers: corsHeaders });
    }

    /* ===== PAUSE ===== */
    if (url.pathname === "/blast/pause") {
      paused = true;
      return new Response("OK", { headers: corsHeaders });
    }

    /* ===== RESUME ===== */
    if (url.pathname === "/blast/resume") {
      paused = false;
      process(env);
      return new Response("OK", { headers: corsHeaders });
    }

    /* ===== CANCEL (INI YANG KEMARIN HILANG) ===== */
    if (url.pathname === "/blast/cancel") {
      Q = [];
      paused = true;
      return new Response("CANCELLED", { headers: corsHeaders });
    }

    /* ===== STATUS ===== */
    if (url.pathname === "/blast/status") {
      const total = sent + failed + Q.length;
      return new Response(JSON.stringify({
        sent,
        failed,
        percent: total ? Math.round((sent / total) * 100) : 0
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    /* ===== META VERIFY ===== */
    if (request.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      if (mode === "subscribe" && token === "integrihub_webhook_2025") {
        return new Response(challenge, { status: 200 });
      }
    }

    /* ===== META EVENTS ===== */
    if (request.method === "POST") {
      const rawText = await request.clone().text();

      const allowRawLog =
        env.DEBUG_RAW === "true" &&
        !isHighTraffic();

      if (allowRawLog) {
        console.log("RAW >>>", rawText);
      }

      let body;
      try { body = JSON.parse(rawText); } catch { body = null; }

      const entries = body?.entry || body?.payload?.entry;
      if (!entries) {
        return new Response("NOT META EVENT", { status: 200 });
      }

      for (const entry of entries) {
        for (const change of entry.changes || []) {
          const v = change.value;
          if (!v) continue;

          if (v.statuses) {
            for (const s of v.statuses) {
              await sendToGS(env.GS_WEBHOOK_URL, {
                direction: "outbound",
                phone: s.recipient_id,
                status: s.status
              });
            }
          }

          if (v.messages) {
            for (const m of v.messages) {
              await sendToGS(env.GS_WEBHOOK_URL, {
                direction: "inbound",
                phone: m.from,
                text: m.text?.body || ""
              });
            }
          }
        }
      }

      return new Response("EVENT_RECEIVED", { status: 200 });
    }

    return new Response("OK", { headers: corsHeaders });
  }
};

/* ===== BLAST PROCESS ===== */
async function process(env, template) {
  while (Q.length) {
    if (paused) return;
    const r = Q.shift().split(",");
    try {
      await send(env, r[0], r.slice(1), template);
      sent++;
    } catch {
      failed++;
      Q.push(r.join(","));
    }
    await sleep(1000);
  }
}

async function send(env, phone, vars, template) {
  const res = await fetch(
    `https://graph.facebook.com/v22.0/${env.PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.META_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: template,
          language: { code: "id" },
          components: [{
            type: "body",
            parameters: vars.map(v => ({ type: "text", text: v }))
          }]
        }
      })
    }
  );

  if (!res.ok) throw new Error("META ERROR");
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function sendToGS(url, payload) {
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
