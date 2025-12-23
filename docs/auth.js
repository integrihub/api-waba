// auth.js — FINAL REAL FIX FOR GITHUB PAGES

const AUTH_KEY = "waba_logged_in";
const BASE_PATH = "/api-waba/";

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
  location.href = BASE_PATH + "index.html";
}

/* ===== PAGE GUARD ===== */
function protectPage() {
  if (!isLoggedIn()) {
    location.href = BASE_PATH + "index.html";
  }
}
