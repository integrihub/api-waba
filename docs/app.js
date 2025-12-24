const API = "https://integrihub-webhook.integrihub.workers.dev";

let blasting = false;
let timer = null;
let fileLoaded = false; // 🔒 guard utama

// ELEMENT
const fileInput = document.getElementById("file");
const templateInput = document.getElementById("template");
const btnStart = document.getElementById("btnStart");
const spinner = document.getElementById("spinner");
const bar = document.getElementById("bar");
const sent = document.getElementById("sent");
const failed = document.getElementById("failed");
const percent = document.getElementById("percent");
const alertBox = document.getElementById("alert");

/* ===== ALERT ===== */
function showAlert(type, msg) {
  alertBox.className = `alert ${type}`;
  alertBox.textContent = msg;
  alertBox.classList.remove("hidden");
}

function hideAlert() {
  alertBox.classList.add("hidden");
}

/* ===== LOGIN ===== */
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
    setLogin();
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
    restoreStatus();
  } else {
    showAlert("error", "❌ Login gagal");
  }
}

/* ===== START BLAST ===== */
async function start() {
  if (blasting) return;

  hideAlert();

  const file = fileInput.files[0];
  const template = templateInput.value.trim();

  if (!file || !template) {
    showAlert("error", "❌ File Excel & Template wajib diisi");
    return;
  }

  if (!file.name.endsWith(".xlsx")) {
    showAlert("error", "❌ File harus format .xlsx");
    return;
  }

  blasting = true;
  fileLoaded = true;
  localStorage.setItem("blasting", "true");

  btnStart.disabled = true;
  spinner.classList.remove("hidden");

  showAlert("info", "⏳ Upload Excel & mulai blast...");

  try {
    const wb = XLSX.read(await file.arrayBuffer());
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);

    await fetch(API + "/blast/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv, template })
    });

    pollStatus();
  } catch (e) {
    stopBlast();
    showAlert("error", "❌ Gagal membaca Excel / upload");
  }
}

/* ===== CONTROL (SAFE + NOTIF) ===== */
function pause() {
  if (!blasting || !fileLoaded) {
    showAlert(
      "info",
      "ℹ️ Pause ga bisa di jalankan karena, Tidak ada blast yang sedang berjalan. Silakan upload file & klik Start."
    );
    return;
  }

  fetch(API + "/blast/pause");
  showAlert("info", "⏸ Blast dipause");
}

function resume() {
  if (!blasting || !fileLoaded) {
    showAlert(
      "info",
      "ℹ️ Resume ga bisa di jalankan karena, Tidak ada blast yang sedang berjalan. Silakan upload file & klik Start."
    );
    return;
  }

  fetch(API + "/blast/resume");
  showAlert("info", "▶ Blast dilanjutkan");
  pollStatus();
}

function cancelBlast() {
  if (!blasting || !fileLoaded) return;

  if (!confirm("Yakin mau CANCEL blast? Tidak bisa dilanjutkan.")) return;

  fetch(API + "/blast/cancel");
  stopBlast();
  showAlert("error", "⛔ Blast dibatalkan");
}

/* ===== STATUS POLLING ===== */
function pollStatus() {
  if (timer) clearInterval(timer);

  timer = setInterval(async () => {
    const r = await fetch(API + "/blast/status");
    const s = await r.json();

    sent.textContent = s.sent;
    failed.textContent = s.failed;
    percent.textContent = s.percent + "%";
    bar.style.width = s.percent + "%";

    if (s.percent >= 100) {
      stopBlast();
      showAlert(
        "success",
        `✅ Blast selesai | Sent: ${s.sent} | Failed: ${s.failed}`
      );
    }
  }, 1500);
}

/* ===== STOP ===== */
function stopBlast() {
  if (timer) clearInterval(timer);
  blasting = false;
  fileLoaded = false;
  localStorage.removeItem("blasting");

  btnStart.disabled = false;
  spinner.classList.add("hidden");
}

/* ===== RESTORE STATUS ===== */
async function restoreStatus() {
  try {
    const r = await fetch(API + "/blast/status");
    const s = await r.json();

    sent.textContent = s.sent;
    failed.textContent = s.failed;
    percent.textContent = s.percent + "%";
    bar.style.width = s.percent + "%";

    if (s.percent > 0 && s.percent < 100) {
      blasting = true;
      fileLoaded = true;
      btnStart.disabled = true;
      spinner.classList.remove("hidden");
      pollStatus();
    }
  } catch {}
}

/* ===== THEME ===== */
function toggleTheme() {
  document.body.classList.toggle("light");
}

