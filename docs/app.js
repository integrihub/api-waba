const API = "https://integrihub-webhook.integrihub.workers.dev";

/* ===== DOM ELEMENTS (WAJIB ADA) ===== */
const loginDiv = document.getElementById("login");
const appDiv   = document.getElementById("app");

const userInput = document.getElementById("user");
const passInput = document.getElementById("pass");

const templateInput = document.getElementById("template");
const fileInput = document.getElementById("file");

const btnStart = document.querySelector(".row button:nth-child(1)");

const sentEl = document.getElementById("sent");
const failedEl = document.getElementById("failed");
const percentEl = document.getElementById("percent");
const barEl = document.getElementById("bar");
const logEl = document.getElementById("log");

/* ===== STATE ===== */
let blasting = false;
let timer = null;

/* ===== LOGIN (JANGAN DIUBAH WORKER) ===== */
async function login() {
  try {
    const r = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: userInput.value,
        password: passInput.value
      })
    });

    const data = await r.json();

    if (data.ok) {
      setLogin(); // dari auth.js
      loginDiv.style.display = "none";
      appDiv.style.display = "block";
    } else {
      alert("Login gagal");
    }
  } catch (e) {
    alert("Server tidak bisa diakses");
    console.error(e);
  }
}

/* ===== START BLAST ===== */
async function start() {
  if (blasting) return;

  const file = fileInput.files[0];
  const template = templateInput.value;

  if (!file || !template) {
    alert("File & template wajib diisi");
    return;
  }

  blasting = true;
  btnStart.disabled = true;
  btnStart.innerHTML = '⏳ Start <span class="spinner"></span>';

  const wb = XLSX.read(await file.arrayBuffer());
  const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);

  await fetch(API + "/blast/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csv, template })
  });

  pollStatus();
}

/* ===== PAUSE / RESUME ===== */
function pause() {
  fetch(API + "/blast/pause");
}

function resume() {
  fetch(API + "/blast/resume");
}

/* ===== STATUS ===== */
function pollStatus() {
  timer = setInterval(async () => {
    const r = await fetch(API + "/blast/status");
    const s = await r.json();

    sentEl.textContent = s.sent;
    failedEl.textContent = s.failed;
    percentEl.textContent = s.percent + "%";
    barEl.style.width = s.percent + "%";

    logEl.innerHTML += `
      <div class="${s.last_error ? 'error' : 'success'}">
        ${s.last_error || "Sukses kirim"}
      </div>
    `;
    logEl.scrollTop = logEl.scrollHeight;

    if (s.percent >= 100) stopBlast();
  }, 1500);
}

function stopBlast() {
  clearInterval(timer);
  blasting = false;
  btnStart.disabled = false;
  btnStart.innerHTML = "▶ Start";
}

/* ===== DARK MODE ===== */
function toggleTheme() {
  document.body.classList.toggle("light");
}
