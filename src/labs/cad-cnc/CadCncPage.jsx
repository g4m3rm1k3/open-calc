import { useState, useCallback } from "react";
import { lazy, Suspense } from "react";

const CADPro = lazy(() => import("../cad-pro/cad/CadPro2"));
const CNCSimPro = lazy(() => import("../cnc-sim/cnc/CNCSim"));

const CSS = `
.cad-cnc-workspace {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #07111e;
  color: #e6eefb;
  font-family: system-ui, sans-serif;
  overflow: hidden;
}
.cad-cnc-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  height: 36px;
  background: #0f172a;
  border-bottom: 1px solid #2b3a55;
  flex-shrink: 0;
  z-index: 100;
}
.cad-cnc-brand {
  font-size: 12px;
  font-weight: 700;
  color: #e6eefb;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.cad-cnc-pipe {
  color: #2b3a55;
  font-size: 14px;
}
.cad-cnc-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 3px;
  letter-spacing: 0.5px;
}
.badge-cad { background: rgba(33,102,255,0.15); color: #94b8ff; border: 1px solid rgba(33,102,255,0.3); }
.badge-cnc { background: rgba(70,216,159,0.12); color: #6ee7b7; border: 1px solid rgba(70,216,159,0.25); }
.cad-cnc-status {
  margin-left: auto;
  font-size: 9px;
  color: #61738e;
  display: flex;
  align-items: center;
  gap: 6px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #46d89f;
  animation: pulse 2s ease-in-out infinite;
}
.status-dot.idle { background: #61738e; animation: none; }
@keyframes pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.cad-cnc-panels {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.cad-panel {
  flex: 1;
  min-width: 0;
  border-right: 2px solid #1e293b;
  overflow: hidden;
  position: relative;
}
.cnc-panel {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  position: relative;
}
.panel-label {
  position: absolute;
  top: 8px;
  left: 12px;
  z-index: 10;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 2px 8px;
  border-radius: 3px;
  pointer-events: none;
}
.panel-label-cad { background: rgba(33,102,255,0.2); color: #63b8ff; border: 1px solid rgba(33,102,255,0.3); }
.panel-label-cnc { background: rgba(70,216,159,0.15); color: #46d89f; border: 1px solid rgba(70,216,159,0.25); }
.import-flash {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 10;
  font-size: 9px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 3px;
  background: rgba(70,216,159,0.2);
  color: #46d89f;
  border: 1px solid rgba(70,216,159,0.4);
  animation: fadeout 2s ease-out forwards;
}
@keyframes fadeout {
  0%,60% { opacity: 1; }
  100% { opacity: 0; pointer-events: none; }
}
.loading-pane {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #61738e;
  font-size: 11px;
}
`;

export default function CadCncPage() {
  const [importedGCode, setImportedGCode] = useState(null);
  const [flashKey, setFlashKey] = useState(0);

  const handleSendToCnc = useCallback((gcode) => {
    setImportedGCode(gcode);
    setFlashKey(k => k + 1);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="cad-cnc-workspace">
        <div className="cad-cnc-topbar">
          <div className="cad-cnc-brand">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" stroke="#94b8ff" strokeWidth="1.5" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="#46d89f" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="#63b8ff" opacity="0.5" />
              <rect x="8" y="8" width="5" height="5" rx="1" stroke="#46d89f" strokeWidth="1.5" />
            </svg>
            CAD · CNC Workspace
          </div>
          <span className="cad-cnc-pipe">|</span>
          <span className="cad-cnc-badge badge-cad">CAD</span>
          <span style={{ fontSize: 9, color: "#61738e" }}>Draw</span>
          <span style={{ fontSize: 11, color: "#2b3a55" }}>→</span>
          <span className="cad-cnc-badge badge-cnc">CNC</span>
          <span style={{ fontSize: 9, color: "#61738e" }}>Simulate</span>
          <div className="cad-cnc-status">
            <span className={`status-dot ${importedGCode ? "" : "idle"}`} />
            {importedGCode ? "G-code loaded in CNC Sim" : "Ready — export from CAD to send"}
          </div>
        </div>

        <div className="cad-cnc-panels">
          <div className="cad-panel">
            <div className="panel-label panel-label-cad">CAD</div>
            <Suspense fallback={<div className="loading-pane">Loading CAD…</div>}>
              <CADPro onSendToCnc={handleSendToCnc} />
            </Suspense>
          </div>

          <div className="cnc-panel">
            <div className="panel-label panel-label-cnc">CNC SIM</div>
            {importedGCode && (
              <div key={flashKey} className="import-flash">
                ✓ G-code received from CAD
              </div>
            )}
            <Suspense fallback={<div className="loading-pane">Loading CNC Sim…</div>}>
              <CNCSimPro importedGCode={importedGCode} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
