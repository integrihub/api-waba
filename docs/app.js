const API = "https://integrihub-webhook.integrihub.workers.dev";

let blasting = false;
let pollTimer = null;

/* =========================
   LOGIN
========================= */
async function login() {
  const r = await fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: document.getElementById("user").value,
      password: document.getElementById("pass").value
    })
  });

  const data = await r.json();

  if (data.ok) {
    setLogin(); // dari auth.js
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
  } else {
    alert("Login gagal");
  }
}

/* =========================
   BLAST
========================= */
async function start() {
  if (blasting) return;

  const file = document.getElementById("file").files[0];
  const template = document.getElementById("template").value;

  if (!file) return alert("Upload file Excel dulu");
  if (!template) return alert("Template wajib diisi");

  blasting = true;
  setStartLoading(true);

  // baca excel
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const csv = XLSX.utils.sheet_to_csv(ws);

  await fetch(API + "/blast/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csv, template })
  });

  pollStatus();
}

async function pause() {
  await fetch(API + "/blast/pause");
}

async function resume() {
  await fetch(API + "/blast/resume");
  pollStatus();
}

/* =========================
   STATUS POLLING
========================= */
async function pollStatus() {
  clearTimeout(pollTimer);

  const r = await fetch(API + "/blast/status");
  const s = await r.json();

  document.getElementById("sent").innerText = s.sent;
  document.getElementById("failed").innerText = s.failed;
  document.getElementById("percent").innerText = s.percent + "%";
  document.getElementById("bar").style.width = s.percent + "%";

  if (s.percent < 100) {
    pollTimer = setTimeout(pollStatus, 1000);
  } else {
    blasting = false;
    setStartLoading(false);
  }
}

/* =========================
   UI HELPERS
========================= */
function setStartLoading(active) {
  const btn = document.getElementById("startBtn");
  const spinner = document.getElementById("spinner");
  const text = document.getElementById("startText");

  if (active) {
    btn.disabled = true;
    spinner.classList.remove("hidden");
    text.innerText = "Processing";
  } else {
    btn.disabled = false;
    spinner.classList.add("hidden");
    text.innerText = "▶ Start";
  }
}

/* =========================
   THEME
========================= */
function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}
