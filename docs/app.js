const API = "https://integrihub-webhook.integrihub.workers.dev";

let blasting = false;

async function start() {
  if (blasting) return;

  const file = document.getElementById("file").files[0];
  const template = document.getElementById("template").value;
  if (!file || !template) return alert("File & template wajib");

  blasting = true;
  startBtn.disabled = true;
  spinner.classList.remove("hidden");
  startText.innerText = "Processing";

  const data = await file.arrayBuffer();
  const wb = XLSX.read(data);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const csv = XLSX.utils.sheet_to_csv(ws);

  await fetch(API + "/blast/upload", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ csv, template })
  });

  poll();
}

async function pause() {
  await fetch(API + "/blast/pause");
}

async function resume() {
  await fetch(API + "/blast/resume");
  poll();
}

async function poll() {
  const r = await fetch(API + "/blast/status");
  const s = await r.json();

  sent.innerText = s.sent;
  failed.innerText = s.failed;
  percent.innerText = s.percent + "%";
  bar.style.width = s.percent + "%";

  if (s.percent < 100) {
    setTimeout(poll, 1000);
  } else {
    blasting = false;
    startBtn.disabled = false;
    spinner.classList.add("hidden");
    startText.innerText = "▶ Start";
  }
}

/* ===== THEME ===== */
function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}
