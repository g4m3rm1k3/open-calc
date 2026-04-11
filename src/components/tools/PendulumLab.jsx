import { useState, useRef, useEffect } from "react";

// ── Pendulum Lab Component ─────────────────────────────────────
export default function PendulumLab({ params }) {
  const [currentPanel, setCurrentPanel] = useState("theory");
  const [labState, setLabState] = useState({
    L: 1.0,
    theta0: 10,
    running: false,
    phase: 0,
    t: 0,
    dataRows: [],
    currentStep: 0,
  });

  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Live calculator state
  const [liveL, setLiveL] = useState(1.0);
  const [liveG, setLiveG] = useState(9.81);

  // Calculate period
  const calculatePeriod = (L, g) => 2 * Math.PI * Math.sqrt(L / g);

  // Draw apparatus
  const drawApparatus = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;

    const g = 9.81;
    const omega = Math.sqrt(g / labState.L);
    const theta =
      ((labState.theta0 * Math.PI) / 180) * Math.cos(labState.phase);
    const pivX = W / 2,
      pivY = H * 0.1;
    const scale = Math.min(W, H) * 0.55;
    const Lpx = labState.L * scale;
    const bx = pivX + Lpx * Math.sin(theta);
    const by = pivY + Lpx * Math.cos(theta);

    // Background
    ctx.fillStyle = "#0b0e12";
    ctx.fillRect(0, 0, W, H);
    // Grid
    ctx.strokeStyle = "rgba(0,229,160,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Support beam
    ctx.fillStyle = "#252e42";
    ctx.fillRect(pivX - 50, pivY - 18, 100, 18);
    ctx.fillStyle = "#4a5a72";
    ctx.fillRect(pivX - 3, pivY - 18, 6, 18);

    // Angle arc
    if (!labState.running) {
      ctx.beginPath();
      const a0 = -Math.PI / 2,
        a1 = a0 + (labState.theta0 * Math.PI) / 180;
      ctx.arc(pivX, pivY, 48, a0, a1);
      ctx.strokeStyle = "rgba(245,166,35,0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#f5a623";
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.fillText("θ₀=" + labState.theta0 + "°", pivX + 52, pivY + 12);
    }

    // Vertical reference
    ctx.beginPath();
    ctx.moveTo(pivX, pivY);
    ctx.lineTo(pivX, pivY + Lpx + 30);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // String
    ctx.beginPath();
    ctx.moveTo(pivX, pivY);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = "#4a5a72";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Length label
    const mx = (pivX + bx) / 2 + 10,
      my = (pivY + by) / 2;
    ctx.fillStyle = "#4a5a72";
    ctx.font = "11px IBM Plex Mono, monospace";
    ctx.fillText("L=" + labState.L.toFixed(2) + "m", mx, my);

    // Pivot
    ctx.beginPath();
    ctx.arc(pivX, pivY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#8a9ab5";
    ctx.fill();

    // Ball
    const br = 14;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(
      bx - br * 0.35,
      by - br * 0.35,
      1,
      bx,
      by,
      br,
    );
    grad.addColorStop(0, "#a0c0e0");
    grad.addColorStop(1, "#253550");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#4da6ff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // DRO readout
    const T = (2 * Math.PI) / omega;
    const T2 = T * T;
    const dro = [
      ["L (m)", labState.L.toFixed(4)],
      ["θ₀ (°)", labState.theta0.toFixed(1)],
      ["T (s)", T.toFixed(4)],
      ["T² (s²)", T2.toFixed(4)],
      ["ω (rad/s)", omega.toFixed(4)],
    ];
    ctx.fillStyle = "rgba(17,21,32,0.85)";
    ctx.fillRect(W - 190, 14, 176, 16 + dro.length * 20);
    dro.forEach(([k, v], i) => {
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.fillStyle = "#4a5a72";
      ctx.fillText(k, W - 184, 30 + i * 20);
      ctx.fillStyle = "#00e5a0";
      ctx.textAlign = "right";
      ctx.fillText(v, W - 18, 30 + i * 20);
      ctx.textAlign = "left";
    });
  };

  // Animation loop
  useEffect(() => {
    if (labState.running) {
      const animate = () => {
        setLabState((prev) => ({
          ...prev,
          phase: prev.phase + 0.05, // dt * omega, simplified
          t: prev.t + 0.016,
        }));
        drawApparatus();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      drawApparatus();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [labState.running, labState.L, labState.theta0, labState.phase]);

  // Initial draw
  useEffect(() => {
    drawApparatus();
  }, []);

  const toggleRun = () => {
    setLabState((prev) => ({
      ...prev,
      running: !prev.running,
      phase: prev.running ? 0 : prev.phase,
    }));
  };

  const resetLab = () => {
    setLabState({
      L: 1.0,
      theta0: 10,
      running: false,
      phase: 0,
      t: 0,
      dataRows: [],
      currentStep: 0,
    });
  };

  const recordPoint = () => {
    const g = 9.81;
    const omega = Math.sqrt(g / labState.L);
    const T = ((2 * Math.PI) / omega) * (1 + (Math.random() - 0.5) * 0.002);
    const T2 = T * T;
    const g_exp = (4 * Math.PI ** 2 * labState.L) / T2;
    const newRow = [
      labState.L.toFixed(3),
      T.toFixed(4),
      T2.toFixed(4),
      g_exp.toFixed(4),
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
            Simple Pendulum
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={toggleRun}
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "11px",
              fontWeight: 500,
              padding: "6px 14px",
              borderRadius: "3px",
              border: "1px solid #00e5a0",
              background: labState.running ? "#00e5a0" : "transparent",
              color: labState.running ? "#0b0e12" : "#00e5a0",
              cursor: "pointer",
            }}
          >
            {labState.running ? "Stop" : "Run"}
          </button>
          <button
            onClick={resetLab}
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "11px",
              fontWeight: 500,
              padding: "6px 14px",
              borderRadius: "3px",
              border: "1px solid #252e42",
              background: "transparent",
              color: "#8a9ab5",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
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
                The Simple Pendulum
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
                Mechanics · Simple Harmonic Motion · Dimensional Analysis
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
                      L =
                    </span>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.01"
                      value={liveL}
                      onChange={(e) => setLiveL(parseFloat(e.target.value))}
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
                      {liveL.toFixed(2)} m
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
                      g =
                    </span>
                    <input
                      type="range"
                      min="1.62"
                      max="24.8"
                      step="0.01"
                      value={liveG}
                      onChange={(e) => setLiveG(parseFloat(e.target.value))}
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
                      {liveG.toFixed(2)} m/s²
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
                    T = {calculatePeriod(liveL, liveG).toFixed(3)} s
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
                  Length L (m)
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.01"
                  value={labState.L}
                  onChange={(e) =>
                    setLabState((prev) => ({
                      ...prev,
                      L: parseFloat(e.target.value),
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
                  {labState.L.toFixed(2)}
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
                  Angle θ₀ (°)
                </span>
                <input
                  type="range"
                  min="2"
                  max="14"
                  step="1"
                  value={labState.theta0}
                  onChange={(e) =>
                    setLabState((prev) => ({
                      ...prev,
                      theta0: parseFloat(e.target.value),
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
                  {labState.theta0.toFixed(0)}
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
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                    padding: "5px 12px",
                    borderRadius: "3px",
                    border: "1px solid #252e42",
                    background: "transparent",
                    color: "#8a9ab5",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
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
                      L (m)
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
                      T (s)
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
                      T² (s²)
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
                      g_exp (m/s²)
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
              Plot T² vs L to extract g from the slope. Slope = 4π²/g.
            </p>
            {/* Placeholder for plot */}
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
