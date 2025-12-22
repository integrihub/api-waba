const API = "https://integrihub-webhook.integrihub.workers.dev";

async function loadHistory() {
  const r = await fetch(API + "/history");
  const data = await r.json();

  rows.innerHTML = "";

  for (const h of data) {
    const durasi =
      h.end ?
      Math.round((new Date(h.end) - new Date(h.start)) / 1000) + "s" :
      "-";

    rows.innerHTML += `
      <tr>
        <td>${new Date(h.start).toLocaleString()}</td>
        <td>${h.template}</td>
        <td>${h.total}</td>
        <td>${h.sent}</td>
        <td>${h.failed}</td>
        <td>${durasi}</td>
        <td>
          <button onclick="view('${h.id}')">👁 View</button>
        </td>
      </tr>
    `;
  }
}

function view(id) {
  alert(
    "Detail blast ID:\n" + id +
    "\n\n(Next step: detail per nomor)"
  );
}

loadHistory();
