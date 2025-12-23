// auth.js — FINAL FIX

const AUTH_KEY = "waba_logged_in";

/* LOGIN STATE */
function setLogin() {
  localStorage.setItem(AUTH_KEY, "true");
}

function isLoggedIn() {
  return localStorage.getItem(AUTH_KEY) === "true";
}

/* LOGOUT */
function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "index.html";
}

/* PAGE PROTECT (PAKAI DI HISTORY SAJA) */
function protectPage() {
  if (!isLoggedIn()) {
    window.location.href = "index.html";
  }
}

