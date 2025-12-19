let Q=[], paused=false, sent=0, failed=0;

export default {
  async fetch(req,env){
    const url=new URL(req.url);

    if (url.pathname === "/login") {
  const b = await req.json();

  if (
    b.username === env.ADMIN_USER &&
    b.password === env.ADMIN_PASS
  ) {
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false }, { status: 401 });
}


    if(url.pathname=="/blast/upload"){
      const b=await req.json();
      Q=b.csv.split("\n").slice(1);
      sent=failed=0;
      paused=false;
      process(env,b.template,b.client);
      return new Response("OK");
    }

    if(url.pathname=="/blast/pause"){ paused=true; return new Response("OK"); }
    if(url.pathname=="/blast/resume"){ paused=false; process(env); return new Response("OK"); }

    if(url.pathname=="/blast/status"){
      const total=sent+failed+Q.length;
      return Response.json({
        sent,failed,
        percent: total?Math.round(sent/total*100):0
      });
    }

    return new Response("READY");
  }
}

async function process(env,template,client){
  while(Q.length){
    if(paused) return;
    const r=Q.shift().split(",");
    try{
      await send(env,r[0],r.slice(1),template);
      sent++;
    }catch(e){
      failed++;
      Q.push(r.join(",")); // retry
    }
    await sleep(1000);
  }
}

async function send(env,phone,vars,template){
  await fetch(`https://graph.facebook.com/v19.0/${env.PHONE_NUMBER_ID}/messages`,{
    method:"POST",
    headers:{
      Authorization:`Bearer ${env.META_TOKEN}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      messaging_product:"whatsapp",
      to:phone,
      type:"template",
      template:{
        name:template,
        language:{code:"id"},
        components:[{
          type:"body",
          parameters:vars.map(v=>({type:"text",text:v}))
        }]
      }
    })
  });
}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

