// ============================================================
// client/js/auth.js
// COPY THIS FILE to: client/js/auth.js
// Matches your exact login.html IDs:
//   loginForm, loginEmail, loginPassword, loginBtn
//   toast, toastMsg, toastIcon, emailMsg, pwMsg
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

  // Already logged in → go straight to discover
  if (Auth.isLoggedIn()) {
    window.location.href = "discover.html";
    return;
  }

  // ── DOM elements (matching your exact login.html IDs) ────
  var loginForm     = document.getElementById("loginForm");
  var loginEmail    = document.getElementById("loginEmail");
  var loginPassword = document.getElementById("loginPassword");
  var loginBtn      = document.getElementById("loginBtn");
  var emailMsg      = document.getElementById("emailMsg");
  var pwMsg         = document.getElementById("pwMsg");
  var toast         = document.getElementById("toast");
  var toastMsg      = document.getElementById("toastMsg");
  var toastIcon     = document.getElementById("toastIcon");

  // ── Show toast using existing HTML element ───────────────
  function showLoginToast(msg, isError) {
    if (!toast) return;
    if (toastMsg)  toastMsg.textContent  = msg;
    if (toastIcon) toastIcon.textContent = isError ? "✕" : "✓";

    // Reset styles, then show
    toast.style.display    = "flex";
    toast.style.opacity    = "1";
    toast.style.background = isError
      ? "rgba(255,61,110,0.15)"
      : "rgba(0,229,195,0.15)";
    toast.style.border     = isError
      ? "1px solid rgba(255,61,110,0.4)"
      : "1px solid rgba(0,229,195,0.4)";
    toast.style.color      = isError ? "#ff3d6e" : "#00e5c3";

    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.style.display = "none"; }, 3500);
  }

  // ── Field error helpers ──────────────────────────────────
  function setErr(el, msgEl, msg) {
    if (el)    el.style.borderColor = "rgba(255,61,110,0.6)";
    if (msgEl) { msgEl.textContent = msg; msgEl.style.color = "#ff3d6e"; }
  }
  function clearErr(el, msgEl) {
    if (el)    el.style.borderColor = "";
    if (msgEl) msgEl.textContent = "";
  }

  // ── Button loading state ─────────────────────────────────
  function setBtnLoading(loading) {
    if (!loginBtn) return;
    loginBtn.disabled = loading;
    loginBtn.textContent = loading ? "Signing in…" : "Sign In";
  }

  // ── LOGIN form submit ────────────────────────────────────
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearErr(loginEmail, emailMsg);
      clearErr(loginPassword, pwMsg);

      var email    = loginEmail  ? loginEmail.value.trim()  : "";
      var password = loginPassword ? loginPassword.value    : "";

      // Validate
      var valid = true;
      if (!email) {
        setErr(loginEmail, emailMsg, "Email is required.");
        valid = false;
      }
      if (!password) {
        setErr(loginPassword, pwMsg, "Password is required.");
        valid = false;
      }
      if (!valid) return;

      setBtnLoading(true);

      var res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password }),
      });

      setBtnLoading(false);

      if (res.ok) {
        Auth.save(res.data.token, res.data.user);
        showLoginToast("Welcome back, " + res.data.user.username + "! 🎵", false);
        setTimeout(function () {
          window.location.href = "discover.html";
        }, 900);
      } else {
        var msg = res.data.message || "Invalid email or password.";
        showLoginToast(msg, true);

        // Highlight specific field
        if (msg.toLowerCase().includes("email")) {
          setErr(loginEmail, emailMsg, msg);
        } else if (msg.toLowerCase().includes("password")) {
          setErr(loginPassword, pwMsg, msg);
        } else {
          setErr(loginPassword, pwMsg, "Invalid credentials.");
        }
      }
    });
  }

  // ── Real-time field validation ───────────────────────────
  if (loginEmail) {
    loginEmail.addEventListener("input", function () {
      if (loginEmail.value.includes("@")) clearErr(loginEmail, emailMsg);
    });
  }
  if (loginPassword) {
    loginPassword.addEventListener("input", function () {
      if (loginPassword.value.length > 0) clearErr(loginPassword, pwMsg);
    });
  }

  // ── Password toggle (matches your pwToggle button) ───────
  // Your HTML already calls togglePw() inline, so we just define it globally
  window.togglePw = function (inputId, btnId) {
    var input = document.getElementById(inputId);
    var btn   = document.getElementById(btnId);
    if (!input) return;
    input.type      = input.type === "password" ? "text" : "password";
    if (btn) btn.textContent = input.type === "password" ? "👁" : "🙈";
  };

  // ── Register form (if you add a sign-up page later) ──────
  // Leave this here so extending is easy:
  var registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var username = (document.getElementById("reg-username") || document.getElementById("regUsername"))?.value.trim();
      var email    = (document.getElementById("reg-email")    || document.getElementById("regEmail"))?.value.trim();
      var password = (document.getElementById("reg-password") || document.getElementById("regPassword"))?.value;

      if (!username || !email || !password) {
        showLoginToast("All fields are required.", true);
        return;
      }
      if (password.length < 6) {
        showLoginToast("Password must be at least 6 characters.", true);
        return;
      }

      var submitBtn = registerForm.querySelector("button[type=submit]");
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Creating…"; }

      var res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username: username, email: email, password: password }),
      });

      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Create Account"; }

      if (res.ok) {
        Auth.save(res.data.token, res.data.user);
        showLoginToast("Account created! Welcome 🎶", false);
        setTimeout(function () { window.location.href = "discover.html"; }, 900);
      } else {
        showLoginToast(res.data.message || "Registration failed.", true);
      }
    });
  }

});