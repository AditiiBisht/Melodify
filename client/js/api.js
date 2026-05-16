// =============================================================
// client/js/api.js
// ⚠️  THIS FILE WAS MISSING — COPY TO: client/js/api.js
// Load this FIRST on every HTML page before any other script:
//   <script src="js/api.js"></script>
// =============================================================

const API_BASE = "http://localhost:5000/api";

// ── Auth helpers ──────────────────────────────────────────────
const Auth = {
  save(token, user) {
    localStorage.setItem("mel_token", token);
    localStorage.setItem("mel_user", JSON.stringify(user));
  },
  token() {
    return localStorage.getItem("mel_token");
  },
  user() {
    const u = localStorage.getItem("mel_user");
    return u ? JSON.parse(u) : null;
  },
  isLoggedIn() {
    return !!this.token();
  },
  logout() {
    localStorage.removeItem("mel_token");
    localStorage.removeItem("mel_user");
    localStorage.removeItem("mel_liked");
    window.location.href = "login.html";
  },
};

// ── Fetch wrapper (used by all other JS files) ────────────────
async function apiFetch(endpoint, options = {}) {
  const headers = { "Content-Type": "application/json" };
  if (Auth.token()) {
    headers["Authorization"] = "Bearer " + Auth.token();
  }
  try {
    const res  = await fetch(API_BASE + endpoint, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error("API Error:", err);
    return {
      ok: false,
      status: 0,
      data: { message: "Cannot reach server. Is it running on port 5000?" },
    };
  }
}

// ── Toast notification ────────────────────────────────────────
function showToast(msg, type) {
  let t = document.getElementById("mel-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "mel-toast";
    document.body.appendChild(t);
  }
  const bg = { success: "#00e5c3", error: "#ff3d6e", info: "#7b5ea7" };
  t.textContent = msg;
  t.style.cssText =
    "position:fixed;bottom:96px;left:50%;transform:translateX(-50%);" +
    "background:" + (bg[type] || bg.info) + ";color:#fff;" +
    "padding:10px 26px;border-radius:24px;font-size:13px;font-weight:600;" +
    "z-index:99999;opacity:1;transition:opacity .3s;pointer-events:none;" +
    "font-family:'DM Sans',sans-serif;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.4);";
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.opacity = "0"; }, 2600);
}