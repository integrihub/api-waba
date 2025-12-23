// auth.js — FINAL FIX (NO DOMCONTENTLOADED BUG)

const AUTH_KEY = "waba_logged_in";

/* ===== LOGIN STATE ===== */
function setLogin() {
  localStorage.setItem(AUTH_KEY, "true");
}

function isLoggedIn() {
  return localStorage.getItem(AUTH_KEY) === "true";
}

/* ===== LOGOUT ===== */
function logout() {
  localStorage.removeItem(AUTH_KEY);
  location.href = "index.html";
}

/* ===== PAGE GUARD ===== */
function protectPage() {
  if (!isLoggedIn()) {
    location.href = "index.html";
  }
}
