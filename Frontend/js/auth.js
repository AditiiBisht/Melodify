// js/auth.js — handles login.html register + login forms
// ──────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, skip straight to discover
  if (Auth.isLoggedIn()) {
    window.location.href = "discover.html";
    return;
  }

  // ── Tab switching ─────────────────────────────────
  const tabLogin    = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const formLogin   = document.getElementById("form-login");
  const formRegister= document.getElementById("form-register");

  function showLogin() {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    formLogin.style.display    = "flex";
    formRegister.style.display = "none";
  }
  function showRegister() {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    formRegister.style.display = "flex";
    formLogin.style.display    = "none";
  }

  tabLogin?.addEventListener("click", showLogin);
  tabRegister?.addEventListener("click", showRegister);

  // ── Helpers ───────────────────────────────────────
  function setError(fieldId, msg) {
    const el = document.getElementById(fieldId);
    if (el) el.textContent = msg;
  }
  function clearErrors(...ids) {
    ids.forEach((id) => setError(id, ""));
  }
  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.textContent = loading ? "Please wait…" : btn.dataset.label;
  }
  function showBanner(id, msg, isError = true) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className   = `form-banner ${isError ? "error" : "success"}`;
    el.style.display = "block";
  }
  function hideBanner(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  }

  // ── LOGIN ─────────────────────────────────────────
  const btnLogin = document.getElementById("btn-login");
  if (btnLogin) btnLogin.dataset.label = btnLogin.textContent;

  formLogin?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors("err-login-email", "err-login-password");
    hideBanner("banner-login");

    const email    = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    let valid = true;
    if (!email)    { setError("err-login-email", "Email is required.");    valid = false; }
    if (!password) { setError("err-login-password", "Password is required."); valid = false; }
    if (!valid) return;

    setLoading(btnLogin, true);

    const { ok, data } = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setLoading(btnLogin, false);

    if (ok) {
      Auth.save(data.token, data.user);
      showBanner("banner-login", "✅ Welcome back, " + data.user.username + "!", false);
      setTimeout(() => (window.location.href = "discover.html"), 800);
    } else {
      showBanner("banner-login", data.message || "Login failed.", true);
    }
  });

  // ── REGISTER ──────────────────────────────────────
  const btnRegister = document.getElementById("btn-register");
  if (btnRegister) btnRegister.dataset.label = btnRegister.textContent;

  formRegister?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors("err-reg-username", "err-reg-email", "err-reg-password", "err-reg-confirm");
    hideBanner("banner-register");

    const username = document.getElementById("reg-username").value.trim();
    const email    = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirm  = document.getElementById("reg-confirm").value;

    let valid = true;
    if (!username)           { setError("err-reg-username", "Username is required.");         valid = false; }
    if (!email)              { setError("err-reg-email",    "Email is required.");             valid = false; }
    if (!password)           { setError("err-reg-password", "Password is required.");         valid = false; }
    if (password.length < 6) { setError("err-reg-password", "Min 6 characters.");             valid = false; }
    if (password !== confirm){ setError("err-reg-confirm",  "Passwords do not match.");       valid = false; }
    if (!valid) return;

    setLoading(btnRegister, true);

    const { ok, data } = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });

    setLoading(btnRegister, false);

    if (ok) {
      Auth.save(data.token, data.user);
      showBanner("banner-register", "🎉 Account created! Taking you in…", false);
      setTimeout(() => (window.location.href = "discover.html"), 800);
    } else {
      showBanner("banner-register", data.message || "Registration failed.", true);
    }
  });

  // Password visibility toggles
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = input.type === "password" ? "👁" : "🙈";
    });
  });
});