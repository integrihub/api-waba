const API = "https://integrihub-webhook.integrihub.workers.dev";

let blasting = false;
let timer = null;

const fileInput = document.getElementById("file");
const templateInput = document.getElementById("template");
const btnStart = document.getElementById("btnStart");
const spinner = document.getElementById("spinner");
const btnText = document.getElementById("btnText");

const sent = document.getElementById("sent");
const failed = document.getElementById("failed");
const percent = document.getElementById("percent");
const bar = document.getElementById("bar");
const alertBox = document.getElementById("alert");

/* ===== ALERT ===== */
function showAlert(msg, type = "info") {
  alertBox.textContent = msg;
  alertBox.className = `alert ${type}`;
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
      username: user.value,
      password: pass.value
    })
  });

  const data = await r.json();

  if (data.ok) {
    setLogin();
    loginDiv = document.getElementById("login");
    appDiv = document.getElementById("app");
    loginDiv.style.display = "none";
    appDiv.style.display = "block";
  } else {
    alert("Login gagal");
  }
}

/* ===== START BLAST ===== */
async function start() {
  hideAlert();

  if (blasting) return;

  const file = fileInput.files[0];
  const template = templateInput.value.trim();

  if (!file) {
    showAlert("❌ File Excel belum dipilih", "error");
    return;
  }

  if (!template) {
    showAlert("❌ Nama template wajib diisi", "error");
    return;
  }

  blasting = true;
  btnStart.disabled = true;
  spinner.classList.remove("hidden");
  btnText.textContent = "Processing...";

  try {
    const wb = XLSX.read(await file.arrayBuffer());
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);

    await fetch(API + "/blast/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv, template })
    });

    showAlert("🚀 Blast dimulai, sedang mengirim pesan...");
    pollStatus();
  } catch (e) {
    showAlert("❌ Gagal memulai blast", "error");
    stopBlast();
  }
}

/* ===== CONTROL ===== */
function pause() {
  fetch(API + "/blast/pause");
  showAlert("⏸ Blast dijeda", "info");
}

function resume() {
  fetch(API + "/blast/resume");
  showAlert("▶ Blast dilanjutkan", "info");
}

/* ===== STATUS ===== */
function pollStatus() {
  timer = setInterval(async () => {
    const r = await fetch(API + "/blast/status");
    const s = await r.json();

    sent.textContent = s.sent;
    failed.textContent = s.failed;
    percent.textContent = s.percent + "%";
    bar.style.width = s.percent + "%";

    if (s.percent >= 100) {
      showAlert("🎉 Blast selesai!", "success");
      stopBlast();
    }
  }, 1500);
}

function stopBlast() {
  clearInterval(timer);
  blasting = false;
  btnStart.disabled = false;
  spinner.classList.add("hidden");
  btnText.textContent = "▶ Start";
}

function toggleTheme() {
  document.body.classList.toggle("light");
}
