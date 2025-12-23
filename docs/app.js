const API = "https://integrihub-webhook.integrihub.workers.dev";

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
    setLogin(); // 🔐 simpan status login
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
  } else {
    alert("Login gagal");
  }
}

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
  spinner.classList.remove("hidden");

  const wb = XLSX.read(await file.arrayBuffer());
  const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);

  await fetch(API + "/blast/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csv, template })
  });

  pollStatus();
}

function pause() { fetch(API + "/blast/pause"); }
function resume() { fetch(API + "/blast/resume"); }

function pollStatus() {
  timer = setInterval(async () => {
    const r = await fetch(API + "/blast/status");
    const s = await r.json();

    sent.textContent = s.sent;
    failed.textContent = s.failed;
    percent.textContent = s.percent + "%";
    bar.style.width = s.percent + "%";

    if (s.percent >= 100) stopBlast();
  }, 1500);
}

function stopBlast() {
  clearInterval(timer);
  blasting = false;
  btnStart.disabled = false;
  spinner.classList.add("hidden");
}

function toggleTheme() {
  document.body.classList.toggle("light");
}

