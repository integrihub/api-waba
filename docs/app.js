const API = "https://WORKER-KAMU";

function log(m){ document.getElementById("log").innerHTML+=m+"<br>"; }

async function login(){
  const r = await fetch(API+"/login",{
    method:"POST",
    body:JSON.stringify({
      u:user.value,
      p:pass.value
    })
  });
  if((await r.text())==="OK"){
    login.style.display="none";
    app.style.display="block";
  } else alert("Login gagal");
}

async function start(){
  const file=fileInput();
  const wb=XLSX.read(await file.arrayBuffer());
  const csv=XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);

  await fetch(API+"/blast/upload",{
    method:"POST",
    body:JSON.stringify({
      client:client.value,
      template:template.value,
      csv
    })
  });

  poll();
}

function pause(){ fetch(API+"/blast/pause",{method:"POST"}); }
function resume(){ fetch(API+"/blast/resume",{method:"POST"}); }

async function poll(){
  setInterval(async()=>{
    const r=await fetch(API+"/blast/status");
    const d=await r.json();
    bar.style.width=d.percent+"%";
    stats.innerText=`Sent: ${d.sent} | Failed: ${d.failed}`;
  },2000);
}

function fileInput(){
  const f=document.getElementById("file").files[0];
  if(!f) throw "Upload file dulu";
  return f;
}
