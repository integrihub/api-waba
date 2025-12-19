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
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
  } else {
    alert("Login gagal");
  }
}
