// =============================================================
// client/js/auth.js
// COPY TO: client/js/auth.js
// Matches your login.html IDs exactly:
//   loginForm, loginEmail, loginPassword, loginBtn
//   emailMsg, pwMsg, toast, toastMsg, toastIcon
// =============================================================

document.addEventListener("DOMContentLoaded", function () {

  // Already logged in → skip to app
  if (Auth.isLoggedIn()) {
    window.location.href = "discover.html";
    return;
  }

  // ── Grab elements ─────────────────────────────────────────
  const loginForm     = document.getElementById("loginForm");
  const loginEmail    = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginBtn      = document.getElementById("loginBtn");
  const emailMsg      = document.getElementById("emailMsg");
  const pwMsg         = document.getElementById("pwMsg");
  const toast         = document.getElementById("toast");
  const toastMsg      = document.getElementById("toastMsg");
  const toastIcon     = document.getElementById("toastIcon");

  // ── Use the existing toast element in login.html ──────────
  function fireToast(msg, isError) {
    if (!toast) { showToast(msg, isError ? "error" : "success"); return; }
    if (toastMsg)  toastMsg.textContent  = msg;
    if (toastIcon) toastIcon.textContent = isError ? "✕" : "✓";
    toast.style.display    = "flex";
    toast.style.opacity    = "1";
    toast.style.background = isError ? "rgba(255,61,110,.15)" : "rgba(0,229,195,.15)";
    toast.style.border     = isError ? "1px solid rgba(255,61,110,.4)" : "1px solid rgba(0,229,195,.4)";
    toast.style.color      = isError ? "#ff3d6e" : "#00e5c3";
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.display = "none"; }, 3500);
  }

  // ── Field helpers ─────────────────────────────────────────
  function markErr(input, msgEl, msg) {
    if (input)  input.style.borderColor = "rgba(255,61,110,.6)";
    if (msgEl) { msgEl.textContent = msg; msgEl.style.color = "#ff3d6e"; }
  }
  function clearErr(input, msgEl) {
    if (input)  input.style.borderColor = "";
    if (msgEl)  msgEl.textContent = "";
  }
  function setLoading(on) {
    if (!loginBtn) return;
    loginBtn.disabled    = on;
    loginBtn.textContent = on ? "Signing in…" : "Sign In";
  }

  // ── LOGIN submit ──────────────────────────────────────────
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErr(loginEmail, emailMsg);
    clearErr(loginPassword, pwMsg);

    const email    = loginEmail?.value.trim()  || "";
    const password = loginPassword?.value       || "";

    let valid = true;
    if (!email)    { markErr(loginEmail,    emailMsg, "Email is required.");    valid = false; }
    if (!password) { markErr(loginPassword, pwMsg,    "Password is required."); valid = false; }
    if (!valid) return;

    setLoading(true);
    const { ok, data } = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);

    if (ok) {
      Auth.save(data.token, data.user);
      fireToast("Welcome back, " + data.user.username + "! 🎵", false);
      setTimeout(() => { window.location.href = "discover.html"; }, 900);
    } else {
      fireToast(data.message || "Invalid email or password.", true);
      markErr(loginPassword, pwMsg, data.message || "Invalid credentials.");
    }
  });

  // ── Real-time clear errors ────────────────────────────────
  loginEmail?.addEventListener("input",    () => clearErr(loginEmail,    emailMsg));
  loginPassword?.addEventListener("input", () => clearErr(loginPassword, pwMsg));

  // ── Password toggle (your HTML calls togglePw() inline) ───
  window.togglePw = function (inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn   = document.getElementById(btnId);
    if (!input) return;
    input.type      = input.type === "password" ? "text" : "password";
    if (btn) btn.textContent = input.type === "password" ? "👁" : "🙈";
  };
});