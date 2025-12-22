// auth.js

const AUTH_KEY = "waba_logged_in";

function setLogin() {
  localStorage.setItem(AUTH_KEY, "true");
}

function isLoggedIn() {
  return localStorage.getItem(AUTH_KEY) === "true";
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "index.html";
}

function protectPage() {
  if (!isLoggedIn()) {
    window.location.href = "index.html";
  }
}
