import { useState } from "react";

// ── Ohm's Law Lab Component ─────────────────────────────────────
export default function OhmLab({ params }) {
  const [currentPanel, setCurrentPanel] = useState("theory");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          background: "#111520",
          borderBottom: "1px solid #252e42",
          padding: "0 20px",
          height: "48px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: 1,
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              border: "2px solid #00e5a0",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 600,
              color: "#00e5a0",
            }}
          >
            φ
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "13px",
              fontWeight: 600,
              color: "#eef2f8",
            }}
          >
            Ohm's Law
          </div>
        </div>
      </div>

      {/* Panel tabs */}
      <div
        style={{
          display: "flex",
          background: "#111520",
          borderBottom: "1px solid #252e42",
          padding: "0 16px",
          flexShrink: 0,
        }}
      >
        {["theory", "apparatus", "data", "analysis"].map((panel) => (
          <button
            key={panel}
            onClick={() => setCurrentPanel(panel)}
            style={{
              padding: "10px 14px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              color: currentPanel === panel ? "#f5a623" : "#4a5a72",
              borderBottom:
                currentPanel === panel
                  ? "2px solid #f5a623"
                  : "2px solid transparent",
              background: "transparent",
              border: "none",
            }}
          >
            {panel}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {currentPanel === "theory" && (
          <div
            style={{
              padding: "28px 32px 40px",
              overflowY: "auto",
              height: "100%",
            }}
          >
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>
              <h1
                style={{
                  fontFamily: "IBM Plex Serif, serif",
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "#eef2f8",
                  marginBottom: "6px",
                }}
              >
                Ohm's Law
              </h1>
              <div
                style={{
                  fontSize: "11px",
                  color: "#4a5a72",
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  marginBottom: "24px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #252e42",
                }}
              >
                Electromagnetism · DC Circuits · Conductance
              </div>
              <p
                style={{ fontSize: "14px", color: "#8a9ab5", lineHeight: 1.8 }}
              >
                Ohm's Law states that the current through a conductor between
                two points is directly proportional to the voltage across the
                two points. V = IR, where R is the resistance.
              </p>
            </div>
          </div>
        )}

        {currentPanel === "apparatus" && (
          <div
            style={{ padding: "24px 28px", overflowY: "auto", height: "100%" }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#eef2f8" }}>
              Apparatus
            </h3>
            <p style={{ fontSize: "12px", color: "#8a9ab5", marginTop: "8px" }}>
              Circuit simulation interface would go here.
            </p>
          </div>
        )}

        {currentPanel === "data" && (
          <div
            style={{ padding: "24px 28px", overflowY: "auto", height: "100%" }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#eef2f8" }}>
              Data
            </h3>
            <p style={{ fontSize: "12px", color: "#8a9ab5", marginTop: "8px" }}>
              Data table would go here.
            </p>
          </div>
        )}

        {currentPanel === "analysis" && (
          <div
            style={{ padding: "24px 28px", overflowY: "auto", height: "100%" }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#eef2f8" }}>
              Analysis
            </h3>
            <p style={{ fontSize: "12px", color: "#8a9ab5", marginTop: "8px" }}>
              Plot I vs V. Slope = 1/R.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
