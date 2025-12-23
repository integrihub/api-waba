const API = "https://integrihub-webhook.integrihub.workers.dev";
const rows = document.getElementById("rows");

async function loadHistory() {
  const r = await fetch(API + "/history");
  const data = await r.json();

  rows.innerHTML = "";

  for (const h of data) {
    const durasi = h.end
      ? Math.round((new Date(h.end) - new Date(h.start)) / 1000) + "s"
      : "-";

    rows.innerHTML += `
      <tr>
        <td>${new Date(h.start).toLocaleString()}</td>
        <td>${h.template}</td>
        <td>${h.total}</td>
        <td>${h.sent}</td>
        <td>${h.failed}</td>
        <td>${durasi}</td>
        <td><button>👁 View</button></td>
      </tr>
    `;
  }
}

loadHistory();
