import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import "./styles/proof.css";

// Apply saved theme before first paint (avoids flash)
const saved = localStorage.getItem("oc-theme");
if (saved === "dark" || !saved) {
  document.documentElement.classList.add("dark");
}

function showUpdateBanner(onReload) {
  if (document.getElementById("oc-update-banner")) return;
  const banner = document.createElement("div");
  banner.id = "oc-update-banner";
  banner.innerHTML = `
    <span style="flex:1">A new version of UpSkillOS is available.</span>
    <button id="oc-reload-btn" style="background:#fff;color:#1d4ed8;border:none;border-radius:6px;padding:4px 12px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap">Reload</button>
    <button onclick="this.parentElement.remove()" style="background:transparent;color:#fff;border:none;font-size:18px;line-height:1;cursor:pointer;padding:0 4px">×</button>
  `;
  Object.assign(banner.style, {
    position: "fixed",
    bottom: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#1d4ed8",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontFamily: "sans-serif",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    zIndex: "99999",
    maxWidth: "calc(100vw - 32px)",
  });
  document.body.appendChild(banner);
  document.getElementById("oc-reload-btn").onclick = onReload || (() => window.location.reload());
}

// Register service worker — keeps index.html fresh so deploys don't blank the page
if ("serviceWorker" in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  navigator.serviceWorker
    .register(import.meta.env.BASE_URL + "sw.js")
    .then((reg) => {
      const swReload = () => {
        if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
        else window.location.reload();
      };
      if (reg.waiting) showUpdateBanner(swReload);
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            showUpdateBanner(swReload);
          }
        });
      });
    })
    .catch(() => {});
}

// Poll version.json every 60 s — catches new deploys while the page stays open.
// The build emits a fresh hash each time, so any deploy triggers the banner
// within one polling cycle even if the SW file itself hasn't changed.
const _base = import.meta.env.BASE_URL;
let _deployVersion = null;
async function _checkVersion() {
  try {
    const { v } = await fetch(`${_base}version.json?t=${Date.now()}`).then(r => r.json());
    if (!_deployVersion) { _deployVersion = v; return; }
    if (v !== _deployVersion) showUpdateBanner();
  } catch {}
}
_checkVersion();
setInterval(_checkVersion, 60_000);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
