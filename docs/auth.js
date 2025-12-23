// auth.js — FINAL FIX (GitHub Pages SAFE)

const AUTH_KEY = "waba_logged_in";
const BASE = "/api-waba/";

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
  window.location.href = BASE + "index.html";
}

/* ===== PROTECT PAGE ===== */
function protectPage() {
  if (!isLoggedIn()) {
    window.location.href = BASE + "index.html";
  }
}
