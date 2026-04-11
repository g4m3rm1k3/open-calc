import { useState, useRef, useEffect } from "react";

// ── Snell's Law Lab Component ─────────────────────────────────────
export default function SnellLab({ params }) {
  const [currentPanel, setCurrentPanel] = useState("theory");
  const [labState, setLabState] = useState({
    theta1: 30,
    n2: 1.5,
    dataRows: [],
  });

  const canvasRef = useRef(null);

  // Live calculator state
  const [liveT1, setLiveT1] = useState(30);
  const [liveN2, setLiveN2] = useState(1.5);

  // Calculate theta2
  const calculateTheta2 = (t1, n2) => {
    const sinT2 = Math.sin((t1 * Math.PI) / 180) / n2;
    if (sinT2 >= 1) return null; // TIR
    return (Math.asin(sinT2) * 180) / Math.PI;
  };

  // Draw apparatus
  const drawApparatus = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;

    const cx = W / 2,
      cy = H / 2;
    const t1r = (labState.theta1 * Math.PI) / 180;
    const sinT2 = Math.sin(t1r) / labState.n2;
    const TIR = sinT2 >= 1;
    const t2r = TIR ? 0 : Math.asin(sinT2);
    const rayLen = Math.min(W, H) * 0.38;

    ctx.fillStyle = "#0b0e12";
    ctx.fillRect(0, 0, W, H);
    // Medium 1 (air)
    ctx.fillStyle = "rgba(77,166,255,0.03)";
    ctx.fillRect(0, 0, W, cy);
    // Medium 2
    ctx.fillStyle = TIR ? "rgba(224,80,80,0.06)" : "rgba(0,229,160,0.05)";
    ctx.fillRect(0, cy, W, H - cy);

    // Boundary
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(W, cy);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.font = "11px IBM Plex Mono, monospace";
    ctx.fillStyle = "rgba(77,166,255,0.6)";
    ctx.fillText("n₁ = 1.00  (air)", 14, cy - 10);
    ctx.fillStyle = TIR ? "rgba(224,80,80,0.7)" : "rgba(0,229,160,0.5)";
    ctx.fillText("n₂ = " + labState.n2.toFixed(2), 14, cy + 22);

    // Normal
    ctx.beginPath();
    ctx.moveTo(cx, cy - H * 0.42);
    ctx.lineTo(cx, cy + H * 0.42);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "10px IBM Plex Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText("normal", cx, cy - H * 0.44);
    ctx.textAlign = "left";

    // Incident ray
    const ix = -Math.sin(t1r) * rayLen,
      iy = -Math.cos(t1r) * rayLen;
    ctx.beginPath();
    ctx.moveTo(cx + ix, cy + iy);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = "#f5a623";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Angle arc + label
    ctx.beginPath();
    ctx.arc(cx, cy, 46, -Math.PI / 2, -Math.PI / 2 + t1r);
    ctx.strokeStyle = "rgba(245,166,35,0.5)";
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.fillStyle = "#f5a623";
    ctx.font = "11px IBM Plex Mono, monospace";
    ctx.fillText(
      "θ₁=" + labState.theta1 + "°",
      cx + 50 * Math.sin(t1r / 2) + 4,
      cy - 48 * Math.cos(t1r / 2) + 4,
    );

    if (!TIR) {
      // Refracted ray
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.sin(t2r) * rayLen, cy + Math.cos(t2r) * rayLen);
      ctx.strokeStyle = "#00e5a0";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 46, Math.PI / 2, Math.PI / 2 + t2r);
      ctx.strokeStyle = "rgba(0,229,160,0.5)";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.fillStyle = "#00e5a0";
      ctx.fillText(
        "θ₂=" + ((t2r * 180) / Math.PI).toFixed(1) + "°",
        cx + 50 * Math.sin(t2r / 2) + 4,
        cy + 48 * Math.cos(t2r / 2) + 4,
      );
    } else {
      // TIR
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx - Math.sin(t1r) * rayLen, cy - Math.cos(t1r) * rayLen);
      ctx.strokeStyle = "#e05050";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = "#e05050";
      ctx.font = "bold 13px IBM Plex Sans, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Total Internal Reflection", cx, cy + 38);
      const tc = (Math.asin(1 / labState.n2) * 180) / Math.PI;
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.fillText("θ_c = " + tc.toFixed(1) + "°   (θ₁ > θ_c)", cx, cy + 56);
      ctx.textAlign = "left";
    }

    // Verification
    const lhs = Math.sin(t1r).toFixed(4);
    const rhs = TIR ? "—" : (labState.n2 * Math.sin(t2r)).toFixed(4);
    ctx.fillStyle = "rgba(17,21,32,0.85)";
    ctx.fillRect(14, H - 52, 260, 38);
    ctx.font = "11px IBM Plex Mono, monospace";
    ctx.fillStyle = "#4a5a72";
    ctx.fillText("n₁ sin θ₁ =", 20, H - 36);
    ctx.fillStyle = "#f5a623";
    ctx.fillText(lhs, 118, H - 36);
    ctx.fillStyle = "#4a5a72";
    ctx.fillText("n₂ sin θ₂ =", 20, H - 18);
    ctx.fillStyle = "#00e5a0";
    ctx.fillText(rhs, 118, H - 18);
  };

  // Initial draw
  useEffect(() => {
    drawApparatus();
  }, [labState.theta1, labState.n2]);

  const recordPoint = () => {
    const t1r = (labState.theta1 * Math.PI) / 180;
    const sinT2 = Math.sin(t1r) / labState.n2;
    if (sinT2 >= 1) return;
    const t2r = Math.asin(sinT2);
    const t2 = (t2r * 180) / Math.PI + (Math.random() - 0.5) * 0.2;
    const newRow = [
      labState.theta1.toFixed(1),
      t2.toFixed(2),
      Math.sin(t1r).toFixed(5),
      Math.sin((t2 * Math.PI) / 180).toFixed(5),
    ];
    setLabState((prev) => ({
      ...prev,
      dataRows: [...prev.dataRows, newRow],
    }));
  };

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
            Snell's Law
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
                Snell's Law & Refraction
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
                Optics · Wave Propagation · Refractive Index
              </div>

              <div style={{ marginBottom: "32px" }}>
                <h2
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "#f5a623",
                    marginBottom: "12px",
                  }}
                >
                  Live Calculator
                </h2>
                <div
                  style={{
                    background: "#1e293b",
                    border: "1px solid #252e42",
                    borderRadius: "4px",
                    padding: "14px 16px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "#8a9ab5" }}>
                      θ₁ =
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="85"
                      step="1"
                      value={liveT1}
                      onChange={(e) => setLiveT1(parseFloat(e.target.value))}
                      style={{ width: "80px", accentColor: "#00e5a0" }}
                    />
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#00e5a0",
                        fontWeight: 500,
                        minWidth: "48px",
                      }}
                    >
                      {liveT1.toFixed(0)}°
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "#8a9ab5" }}>
                      n₂ =
                    </span>
                    <input
                      type="range"
                      min="1.0"
                      max="2.5"
                      step="0.05"
                      value={liveN2}
                      onChange={(e) => setLiveN2(parseFloat(e.target.value))}
                      style={{ width: "80px", accentColor: "#00e5a0" }}
                    />
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#00e5a0",
                        fontWeight: 500,
                        minWidth: "48px",
                      }}
                    >
                      {liveN2.toFixed(2)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "#f5a623",
                      padding: "6px 14px",
                      background: "rgba(245,166,35,0.1)",
                      border: "1px solid rgba(245,166,35,0.2)",
                      borderRadius: "3px",
                    }}
                  >
                    θ₂ = {calculateTheta2(liveT1, liveN2)?.toFixed(1) ?? "TIR"}°
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPanel === "apparatus" && (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              />
            </div>
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 0,
                background: "#111520",
                borderTop: "1px solid #252e42",
                height: "72px",
                padding: "0 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0 16px",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                    color: "#4a5a72",
                  }}
                >
                  Incident θ₁ (°)
                </span>
                <input
                  type="range"
                  min="5"
                  max="85"
                  step="1"
                  value={labState.theta1}
                  onChange={(e) =>
                    setLabState((prev) => ({
                      ...prev,
                      theta1: parseFloat(e.target.value),
                    }))
                  }
                  style={{ width: "90px", accentColor: "#00e5a0" }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#00e5a0",
                    minWidth: "44px",
                  }}
                >
                  {labState.theta1.toFixed(0)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0 16px",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                    color: "#4a5a72",
                  }}
                >
                  Index n₂
                </span>
                <input
                  type="range"
                  min="1.05"
                  max="2.5"
                  step="0.05"
                  value={labState.n2}
                  onChange={(e) =>
                    setLabState((prev) => ({
                      ...prev,
                      n2: parseFloat(e.target.value),
                    }))
                  }
                  style={{ width: "90px", accentColor: "#00e5a0" }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#00e5a0",
                    minWidth: "44px",
                  }}
                >
                  {labState.n2.toFixed(2)}
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <button
                onClick={recordPoint}
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                  padding: "6px 14px",
                  borderRadius: "3px",
                  border: "1px solid #4da6ff",
                  background: "rgba(77,166,255,0.1)",
                  color: "#4da6ff",
                  cursor: "pointer",
                }}
              >
                Record Point
              </button>
            </div>
          </div>
        )}

        {currentPanel === "data" && (
          <div
            style={{ padding: "24px 28px", overflowY: "auto", height: "100%" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                marginBottom: "16px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#eef2f8",
                  }}
                >
                  Data Table
                </h3>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#4a5a72",
                    textTransform: "uppercase",
                    marginTop: "2px",
                  }}
                >
                  Experimental measurements
                </p>
              </div>
            </div>
            <div style={{ overflowX: "auto", marginBottom: "16px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "12px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#1e293b",
                      borderBottom: "1px solid #252e42",
                    }}
                  >
                    <th
                      style={{
                        padding: "8px 14px",
                        textAlign: "left",
                        fontSize: "10px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        color: "#4a5a72",
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        padding: "8px 14px",
                        textAlign: "left",
                        fontSize: "10px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        color: "#4a5a72",
                      }}
                    >
                      θ₁ (°)
                    </th>
                    <th
                      style={{
                        padding: "8px 14px",
                        textAlign: "left",
                        fontSize: "10px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        color: "#4a5a72",
                      }}
                    >
                      θ₂ (°)
                    </th>
                    <th
                      style={{
                        padding: "8px 14px",
                        textAlign: "left",
                        fontSize: "10px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        color: "#4a5a72",
                      }}
                    >
                      sin θ₁
                    </th>
                    <th
                      style={{
                        padding: "8px 14px",
                        textAlign: "left",
                        fontSize: "10px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        color: "#4a5a72",
                      }}
                    >
                      sin θ₂
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {labState.dataRows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #334155" }}>
                      <td
                        style={{
                          padding: "7px 14px",
                          color: "#4a5a72",
                          fontFamily: "IBM Plex Mono, monospace",
                        }}
                      >
                        {i + 1}
                      </td>
                      <td
                        style={{
                          padding: "7px 14px",
                          color: "#4da6ff",
                          fontFamily: "IBM Plex Mono, monospace",
                        }}
                      >
                        {row[0]}
                      </td>
                      <td
                        style={{
                          padding: "7px 14px",
                          color: "#4da6ff",
                          fontFamily: "IBM Plex Mono, monospace",
                        }}
                      >
                        {row[1]}
                      </td>
                      <td
                        style={{
                          padding: "7px 14px",
                          color: "#f5a623",
                          fontFamily: "IBM Plex Mono, monospace",
                        }}
                      >
                        {row[2]}
                      </td>
                      <td
                        style={{
                          padding: "7px 14px",
                          color: "#f5a623",
                          fontFamily: "IBM Plex Mono, monospace",
                        }}
                      >
                        {row[3]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentPanel === "analysis" && (
          <div
            style={{ padding: "24px 28px", overflowY: "auto", height: "100%" }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#eef2f8",
                marginBottom: "16px",
              }}
            >
              Analysis
            </h3>
            <p
              style={{
                fontSize: "12px",
                color: "#8a9ab5",
                marginBottom: "20px",
              }}
            >
              Plot sin θ₂ vs sin θ₁. Slope = 1/n₂.
            </p>
            <div
              style={{
                background: "#1e293b",
                border: "1px solid #252e42",
                borderRadius: "4px",
                height: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4a5a72",
              }}
            >
              Plot visualization would go here
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
