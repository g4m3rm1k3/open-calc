import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, ChevronRight, Play, RotateCcw, Plus, Trash2 } from "lucide-react";
import { buildNetlist, solveAnalog } from "./AnalogEngine.js";

// ── Constants ─────────────────────────────────────────────────────────────────
const CELL = 24;          // grid cell size px
const PORT_R = 4;         // hole radius

// ── Colors ───────────────────────────────────────────────────────────────────
function getColors(dark) {
  return {
    bg:       dark ? "#0f1923" : "#f8fafc",
    board:    dark ? "#e2e8f0" : "#ffffff",
    boardHole:dark ? "#334155" : "#94a3b8",
    railRed:  "#ef4444",
    railBlue: "#3b82f6",
    text:     dark ? "#e2e8f0" : "#1e293b",
    wire:     dark ? "#34d399" : "#059669",
    wireHi:   dark ? "#38bdf8" : "#0284c7",
    icBody:   dark ? "#1e293b" : "#334155",
    icPins:   dark ? "#cbd5e1" : "#94a3b8",
    icText:   dark ? "#94a3b8" : "#e2e8f0",
    ledOff:   dark ? "#450a0a" : "#fef2f2",
    ledOn:    "#ef4444",
    sel:      "#38bdf8",
  };
}

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    update();
    const ob = new MutationObserver(update);
    ob.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => ob.disconnect();
  }, []);
  return isDark;
}

// ── Component Definitions ─────────────────────────────────────────────────────
const PIN_IN = "IN", PIN_OUT = "OUT", PIN_PWR = "PWR", PIN_GND = "GND";

const COMP_DEFS = {
  POWER_SUPPLY: {
    w: 2, h: 2,
    pins: [
      { id: "5v", x: 0, y: 0, type: PIN_PWR },
      { id: "gnd", x: 1, y: 0, type: PIN_GND }
    ],
    render: (ctx, x, y, w, h, C) => {
      ctx.fillStyle = C.icBody; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = C.railRed; ctx.fillRect(x, y, w/2, h);
      ctx.fillStyle = C.railBlue; ctx.fillRect(x+w/2, y, w/2, h);
      ctx.fillStyle = "#fff"; ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("+", x+w/4, y+h/2); ctx.fillText("-", x+w*0.75, y+h/2);
    }
  },
  RESISTOR: {
    w: 4, h: 1,
    pins: [
      { id: "p1", x: 0, y: 0, type: PIN_IN },
      { id: "p2", x: 3, y: 0, type: PIN_IN }
    ],
    render: (ctx, x, y, w, h, C, state) => {
      // Draw leads
      ctx.strokeStyle = C.icPins; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x+CELL/2, y+CELL/2); ctx.lineTo(x+w-CELL/2, y+CELL/2); ctx.stroke();
      // Draw body
      const bw = 2.5 * CELL, bh = 14;
      ctx.fillStyle = "#eab308"; // Tan body
      ctx.fillRect(x + w/2 - bw/2, y + CELL/2 - bh/2, bw, bh);
      // Color bands
      const bands = state.bands || ["red", "red", "brown"];
      for (let i=0; i<3; i++) {
        ctx.fillStyle = bands[i];
        ctx.fillRect(x + w/2 - bw/2 + 8 + i*8, y + CELL/2 - bh/2, 4, bh);
      }
      ctx.fillStyle = "#d4af37"; // Gold tolerance
      ctx.fillRect(x + w/2 + bw/2 - 12, y + CELL/2 - bh/2, 4, bh);
    }
  },
  CAPACITOR: {
    w: 2, h: 1,
    pins: [
      { id: "p1", x: 0, y: 0, type: PIN_IN },
      { id: "p2", x: 1, y: 0, type: PIN_IN }
    ],
    render: (ctx, x, y, w, h, C, state) => {
      // Draw leads
      ctx.strokeStyle = C.icPins; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x+CELL/2, y+CELL/2); ctx.lineTo(x+w-CELL/2, y+CELL/2); ctx.stroke();
      // Electrolytic body
      ctx.fillStyle = "#0f172a";
      ctx.beginPath(); ctx.arc(x+w/2, y+CELL/2, 10, 0, Math.PI*2); ctx.fill();
      // Negative stripe
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(x+w/2+4, y+CELL/2-6, 4, 12);
    }
  },
  LED: {
    w: 2, h: 2,
    pins: [
      { id: "anode", x: 0, y: 1, type: PIN_IN },
      { id: "cathode", x: 1, y: 1, type: PIN_IN }
    ],
    render: (ctx, x, y, w, h, C, state, inputs, simState) => {
      let isOn = false;
      if (state.voltageDiff && state.voltageDiff > 1.8) isOn = true;

      ctx.fillStyle = isOn ? C.ledOn : C.ledOff;
      ctx.beginPath(); ctx.arc(x+w/2, y+h/2, w/2 - 4, 0, Math.PI*2); ctx.fill();
      if (isOn) { ctx.shadowColor = C.ledOn; ctx.shadowBlur = 15; ctx.fill(); ctx.shadowBlur = 0; }
    }
  },
  DIODE: {
    w: 2, h: 1,
    pins: [
      { id: "anode", x: 0, y: 0, type: PIN_IN },
      { id: "cathode", x: 1, y: 0, type: PIN_IN }
    ],
    render: (ctx, x, y, w, h, C) => {
      ctx.strokeStyle = C.icPins; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x+CELL/2, y+CELL/2); ctx.lineTo(x+w-CELL/2, y+CELL/2); ctx.stroke();
      ctx.fillStyle = "#ef4444"; // glass body
      ctx.fillRect(x + CELL/2 + 4, y + CELL/2 - 5, w - CELL - 8, 10);
      ctx.fillStyle = "#1e293b"; // cathode stripe
      ctx.fillRect(x + w - CELL/2 - 8, y + CELL/2 - 5, 4, 10);
    }
  },
  POTENTIOMETER: {
    w: 3, h: 1,
    pins: [
      { id: "p1", x: 0, y: 0, type: PIN_IN }, { id: "pw", x: 1, y: 0, type: PIN_IN }, { id: "p2", x: 2, y: 0, type: PIN_IN }
    ],
    render: (ctx, x, y, w, h, C, state) => {
      ctx.fillStyle = "#3b82f6"; ctx.fillRect(x, y-CELL/2, w, h+CELL);
      ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.arc(x+w/2, y+h/2, CELL/1.5, 0, Math.PI*2); ctx.fill();
      const val = state.value ?? 0.5;
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x+w/2, y+h/2);
      ctx.lineTo(x+w/2 + Math.cos(val*Math.PI)*10, y+h/2 - Math.sin(val*Math.PI)*10); ctx.stroke();
    }
  },
  PHOTORESISTOR: {
    w: 2, h: 1,
    pins: [
      { id: "p1", x: 0, y: 0, type: PIN_IN }, { id: "p2", x: 1, y: 0, type: PIN_IN }
    ],
    render: (ctx, x, y, w, h, C) => {
      ctx.strokeStyle = C.icPins; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x+CELL/2, y+CELL/2); ctx.lineTo(x+w-CELL/2, y+CELL/2); ctx.stroke();
      ctx.fillStyle = "#eab308";
      ctx.beginPath(); ctx.arc(x+w/2, y+CELL/2, 8, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = "#a16207";
      ctx.beginPath(); ctx.moveTo(x+w/2-4, y+CELL/2); ctx.lineTo(x+w/2+4, y+CELL/2); ctx.stroke();
    }
  },
  NPN_TRANSISTOR: {
    w: 3, h: 1,
    pins: [
      { id: "e", x: 0, y: 0, type: PIN_IN }, { id: "b", x: 1, y: 0, type: PIN_IN }, { id: "c", x: 2, y: 0, type: PIN_IN }
    ],
    render: (ctx, x, y, w, h, C) => {
      ctx.fillStyle = "#1e293b";
      ctx.beginPath(); ctx.arc(x+w/2, y+CELL/2, 10, Math.PI, 0); ctx.fill();
      ctx.fillRect(x+w/2-10, y+CELL/2, 20, 4);
      ctx.fillStyle = "#94a3b8"; ctx.font = "8px sans-serif"; ctx.textAlign="center";
      ctx.fillText("NPN", x+w/2, y+CELL/2-2);
    }
  },
  PNP_TRANSISTOR: {
    w: 3, h: 1,
    pins: [
      { id: "e", x: 0, y: 0, type: PIN_IN }, { id: "b", x: 1, y: 0, type: PIN_IN }, { id: "c", x: 2, y: 0, type: PIN_IN }
    ],
    render: (ctx, x, y, w, h, C) => {
      ctx.fillStyle = "#1e293b";
      ctx.beginPath(); ctx.arc(x+w/2, y+CELL/2, 10, Math.PI, 0); ctx.fill();
      ctx.fillRect(x+w/2-10, y+CELL/2, 20, 4);
      ctx.fillStyle = "#94a3b8"; ctx.font = "8px sans-serif"; ctx.textAlign="center";
      ctx.fillText("PNP", x+w/2, y+CELL/2-2);
    }
  },
  DIP_SWITCH: {
    w: 4, h: 4,
    pins: [
      { id: "1t", x: 0, y: 0, type: PIN_IN }, { id: "2t", x: 1, y: 0, type: PIN_IN }, { id: "3t", x: 2, y: 0, type: PIN_IN }, { id: "4t", x: 3, y: 0, type: PIN_IN },
      { id: "4b", x: 3, y: 3, type: PIN_IN }, { id: "3b", x: 2, y: 3, type: PIN_IN }, { id: "2b", x: 1, y: 3, type: PIN_IN }, { id: "1b", x: 0, y: 3, type: PIN_IN }
    ],
    render: (ctx, x, y, w, h, C, state) => {
      ctx.fillStyle = "#ef4444"; ctx.fillRect(x, y+CELL/2, w, h-CELL);
      const sw = state.switches || [false,false,false,false];
      for (let i=0; i<4; i++) {
        ctx.fillStyle = "#1e293b"; ctx.fillRect(x+i*CELL+4, y+CELL, 16, 24);
        ctx.fillStyle = "#f8fafc";
        if (sw[i]) ctx.fillRect(x+i*CELL+4, y+CELL, 16, 12);
        else ctx.fillRect(x+i*CELL+4, y+CELL+12, 16, 12);
      }
    }
  },
  SWITCH: {
    w: 2, h: 3,
    pins: [
      { id: "l1", x: 0, y: 0, type: PIN_IN },
      { id: "r1", x: 1, y: 0, type: PIN_IN },
      { id: "l2", x: 0, y: 2, type: PIN_IN },
      { id: "r2", x: 1, y: 2, type: PIN_IN }
    ],
    render: (ctx, x, y, w, h, C, state) => {
      ctx.fillStyle = state.on ? "#64748b" : "#94a3b8";
      ctx.fillRect(x+2, y+2, w-4, h-4);
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath(); ctx.arc(x+w/2, y+h/2, Math.min(w,h)/4, 0, Math.PI*2); ctx.fill();
    }
  },
  "555_TIMER": {
    w: 4, h: 4,
    pins: [
      { id: "1_gnd", x: 0, y: 3, type: PIN_GND }, { id: "2_trig", x: 1, y: 3, type: PIN_IN }, { id: "3_out", x: 2, y: 3, type: PIN_OUT }, { id: "4_rst", x: 3, y: 3, type: PIN_IN },
      { id: "8_vcc", x: 0, y: 0, type: PIN_PWR }, { id: "7_disch", x: 1, y: 0, type: PIN_IN }, { id: "6_thres", x: 2, y: 0, type: PIN_IN }, { id: "5_ctrl", x: 3, y: 0, type: PIN_IN }
    ],
    render: (ctx, x, y, w, h, C) => {
      ctx.fillStyle = C.icBody; ctx.fillRect(x - CELL/4, y + CELL/2, w + CELL/2, h - CELL);
      ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(x - CELL/4, y + h/2, CELL/4, -Math.PI/2, Math.PI/2); ctx.fill();
      ctx.fillStyle = C.icText; ctx.font = "bold 12px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("555", x + w/2, y + h/2);
      ctx.fillStyle = C.icPins;
      for (let i=0; i<4; i++) {
        ctx.fillRect(x + i*CELL - 2, y + CELL/2 - 6, 4, 6);
        ctx.fillRect(x + i*CELL - 2, y + h - CELL/2, 4, 6);
      }
    }
  },
  "74HC00": { // NAND
    w: 7, h: 4,
    pins: [
      { id: "1A", x: 0, y: 3, type: PIN_IN }, { id: "1B", x: 1, y: 3, type: PIN_IN }, { id: "1Y", x: 2, y: 3, type: PIN_OUT }, { id: "2A", x: 3, y: 3, type: PIN_IN }, { id: "2B", x: 4, y: 3, type: PIN_IN }, { id: "2Y", x: 5, y: 3, type: PIN_OUT }, { id: "GND", x: 6, y: 3, type: PIN_GND },
      { id: "VCC", x: 0, y: 0, type: PIN_PWR }, { id: "4B", x: 1, y: 0, type: PIN_IN }, { id: "4A", x: 2, y: 0, type: PIN_IN }, { id: "4Y", x: 3, y: 0, type: PIN_OUT }, { id: "3B", x: 4, y: 0, type: PIN_IN }, { id: "3A", x: 5, y: 0, type: PIN_IN }, { id: "3Y", x: 6, y: 0, type: PIN_OUT }
    ],
    render: (ctx, x, y, w, h, C) => {
      ctx.fillStyle = C.icBody; ctx.fillRect(x - CELL/4, y + CELL/2, w + CELL/2, h - CELL);
      ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(x - CELL/4, y + h/2, CELL/4, -Math.PI/2, Math.PI/2); ctx.fill();
      ctx.fillStyle = C.icText; ctx.font = "bold 12px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("74HC00 NAND", x + w/2, y + h/2);
    }
  },
  "74HC04": { // NOT
    w: 7, h: 4,
    pins: [
      { id: "1A", x: 0, y: 3, type: PIN_IN }, { id: "1Y", x: 1, y: 3, type: PIN_OUT }, { id: "2A", x: 2, y: 3, type: PIN_IN }, { id: "2Y", x: 3, y: 3, type: PIN_OUT }, { id: "3A", x: 4, y: 3, type: PIN_IN }, { id: "3Y", x: 5, y: 3, type: PIN_OUT }, { id: "GND", x: 6, y: 3, type: PIN_GND },
      { id: "VCC", x: 0, y: 0, type: PIN_PWR }, { id: "6A", x: 1, y: 0, type: PIN_IN }, { id: "6Y", x: 2, y: 0, type: PIN_OUT }, { id: "5A", x: 3, y: 0, type: PIN_IN }, { id: "5Y", x: 4, y: 0, type: PIN_OUT }, { id: "4A", x: 5, y: 0, type: PIN_IN }, { id: "4Y", x: 6, y: 0, type: PIN_OUT }
    ],
    render: (ctx, x, y, w, h, C) => {
      ctx.fillStyle = C.icBody; ctx.fillRect(x - CELL/4, y + CELL/2, w + CELL/2, h - CELL);
      ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(x - CELL/4, y + h/2, CELL/4, -Math.PI/2, Math.PI/2); ctx.fill();
      ctx.fillStyle = C.icText; ctx.font = "bold 12px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("74HC04 NOT", x + w/2, y + h/2);
    }
  },
  "74HC08": { // AND
    w: 7, h: 4,
    pins: [
      { id: "1A", x: 0, y: 3, type: PIN_IN }, { id: "1B", x: 1, y: 3, type: PIN_IN }, { id: "1Y", x: 2, y: 3, type: PIN_OUT }, { id: "2A", x: 3, y: 3, type: PIN_IN }, { id: "2B", x: 4, y: 3, type: PIN_IN }, { id: "2Y", x: 5, y: 3, type: PIN_OUT }, { id: "GND", x: 6, y: 3, type: PIN_GND },
      { id: "VCC", x: 0, y: 0, type: PIN_PWR }, { id: "4B", x: 1, y: 0, type: PIN_IN }, { id: "4A", x: 2, y: 0, type: PIN_IN }, { id: "4Y", x: 3, y: 0, type: PIN_OUT }, { id: "3B", x: 4, y: 0, type: PIN_IN }, { id: "3A", x: 5, y: 0, type: PIN_IN }, { id: "3Y", x: 6, y: 0, type: PIN_OUT }
    ],
    render: (ctx, x, y, w, h, C) => {
      ctx.fillStyle = C.icBody; ctx.fillRect(x - CELL/4, y + CELL/2, w + CELL/2, h - CELL);
      ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(x - CELL/4, y + h/2, CELL/4, -Math.PI/2, Math.PI/2); ctx.fill();
      ctx.fillStyle = C.icText; ctx.font = "bold 12px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("74HC08 AND", x + w/2, y + h/2);
    }
  },
  "74HC32": { // OR
    w: 7, h: 4,
    pins: [
      { id: "1A", x: 0, y: 3, type: PIN_IN }, { id: "1B", x: 1, y: 3, type: PIN_IN }, { id: "1Y", x: 2, y: 3, type: PIN_OUT }, { id: "2A", x: 3, y: 3, type: PIN_IN }, { id: "2B", x: 4, y: 3, type: PIN_IN }, { id: "2Y", x: 5, y: 3, type: PIN_OUT }, { id: "GND", x: 6, y: 3, type: PIN_GND },
      { id: "VCC", x: 0, y: 0, type: PIN_PWR }, { id: "4B", x: 1, y: 0, type: PIN_IN }, { id: "4A", x: 2, y: 0, type: PIN_IN }, { id: "4Y", x: 3, y: 0, type: PIN_OUT }, { id: "3B", x: 4, y: 0, type: PIN_IN }, { id: "3A", x: 5, y: 0, type: PIN_IN }, { id: "3Y", x: 6, y: 0, type: PIN_OUT }
    ],
    render: (ctx, x, y, w, h, C) => {
      ctx.fillStyle = C.icBody; ctx.fillRect(x - CELL/4, y + CELL/2, w + CELL/2, h - CELL);
      ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(x - CELL/4, y + h/2, CELL/4, -Math.PI/2, Math.PI/2); ctx.fill();
      ctx.fillStyle = C.icText; ctx.font = "bold 12px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("74HC32 OR", x + w/2, y + h/2);
    }
  },
  SEVEN_SEG: {
    w: 5, h: 4,
    pins: [
      { id: "e", x: 0, y: 3, type: PIN_IN }, { id: "d", x: 1, y: 3, type: PIN_IN }, { id: "com1", x: 2, y: 3, type: PIN_GND }, { id: "c", x: 3, y: 3, type: PIN_IN }, { id: "dp", x: 4, y: 3, type: PIN_IN },
      { id: "g", x: 0, y: 0, type: PIN_IN }, { id: "f", x: 1, y: 0, type: PIN_IN }, { id: "com2", x: 2, y: 0, type: PIN_GND }, { id: "a", x: 3, y: 0, type: PIN_IN }, { id: "b", x: 4, y: 0, type: PIN_IN }
    ],
    render: (ctx, x, y, w, h, C, state, inputs, simState) => {
      ctx.fillStyle = "#1e293b"; ctx.fillRect(x, y + CELL/2, w, h - CELL);
      
      const v_com = Math.min(inputs["com1"] || 5, inputs["com2"] || 5);
      const checkOn = (v) => (v - v_com) > 1.8;
      const segs = {
        a: checkOn(inputs.a), b: checkOn(inputs.b), c: checkOn(inputs.c),
        d: checkOn(inputs.d), e: checkOn(inputs.e), f: checkOn(inputs.f),
        g: checkOn(inputs.g), dp: checkOn(inputs.dp)
      };
      
      const drawSeg = (sx, sy, sw, sh, on) => {
        ctx.fillStyle = on ? C.ledOn : C.ledOff;
        ctx.fillRect(x + sx, y + CELL/2 + sy, sw, sh);
      };
      const cx = w/2, cy = (h-CELL)/2, l = CELL*1.5, t = 4;
      drawSeg(cx - l/2, cy - l - t/2, l, t, segs.a);
      drawSeg(cx - l/2, cy - t/2, l, t, segs.g);
      drawSeg(cx - l/2, cy + l - t/2, l, t, segs.d);
      drawSeg(cx - l/2 - t/2, cy - l, t, l, segs.f);
      drawSeg(cx + l/2 - t/2, cy - l, t, l, segs.b);
      drawSeg(cx - l/2 - t/2, cy, t, l, segs.e);
      drawSeg(cx + l/2 - t/2, cy, t, l, segs.c);
      
      ctx.fillStyle = C.icPins;
      for (let i=0; i<5; i++) {
        ctx.fillRect(x + i*CELL - 2, y + CELL/2 - 6, 4, 6);
        ctx.fillRect(x + i*CELL - 2, y + h - CELL/2, 4, 6);
      }
    }
  }
};

// ── Drawers UI Data ───────────────────────────────────────────────────────────
const DRAWERS = [
  {
    title: "Power & Inputs",
    items: [
      { type: "POWER_SUPPLY", label: "5V Power Supply" },
      { type: "SWITCH", label: "Pushbutton" },
      { type: "DIP_SWITCH", label: "4-Pos DIP Switch", state: { switches: [false,false,false,false] } },
      { type: "POTENTIOMETER", label: "10k Potentiometer", state: { value: 0.5 } }
    ]
  },
  {
    title: "Resistors",
    items: [
      { type: "RESISTOR", label: "220 Ω (Red-Red-Brown)", state: { value: 220, bands: ["#ef4444", "#ef4444", "#8b4513"] } },
      { type: "RESISTOR", label: "330 Ω (Org-Org-Brown)", state: { value: 330, bands: ["#f97316", "#f97316", "#8b4513"] } },
      { type: "RESISTOR", label: "1k Ω (Brown-Blk-Red)", state: { value: 1000, bands: ["#8b4513", "#000000", "#ef4444"] } },
      { type: "RESISTOR", label: "4.7k Ω (Yel-Vio-Red)", state: { value: 4700, bands: ["#eab308", "#8b5cf6", "#ef4444"] } },
      { type: "RESISTOR", label: "10k Ω (Brown-Blk-Org)", state: { value: 10000, bands: ["#8b4513", "#000000", "#f97316"] } },
      { type: "RESISTOR", label: "100k Ω (Brown-Blk-Yel)", state: { value: 100000, bands: ["#8b4513", "#000000", "#eab308"] } },
      { type: "RESISTOR", label: "1M Ω (Brown-Blk-Grn)", state: { value: 1000000, bands: ["#8b4513", "#000000", "#22c55e"] } },
      { type: "PHOTORESISTOR", label: "Photoresistor (LDR)", state: { light: 0.5 } }
    ]
  },
  {
    title: "Capacitors",
    items: [
      { type: "CAPACITOR", label: "10 nF Ceramic", state: { value: 0.00000001 } },
      { type: "CAPACITOR", label: "100 nF Ceramic", state: { value: 0.0000001 } },
      { type: "CAPACITOR", label: "10 µF Electrolytic", state: { value: 0.00001 } },
      { type: "CAPACITOR", label: "100 µF Electrolytic", state: { value: 0.0001 } },
      { type: "CAPACITOR", label: "1000 µF Electrolytic", state: { value: 0.001 } }
    ]
  },
  {
    title: "Semiconductors",
    items: [
      { type: "LED", label: "Red LED" },
      { type: "DIODE", label: "1N4148 Diode" },
      { type: "NPN_TRANSISTOR", label: "2N3904 (NPN)" },
      { type: "PNP_TRANSISTOR", label: "2N3906 (PNP)" },
      { type: "SEVEN_SEG", label: "7-Segment Display" }
    ]
  },
  {
    title: "Logic ICs",
    items: [
      { type: "555_TIMER", label: "555 Timer IC" },
      { type: "74HC00", label: "74HC00 (Quad NAND)" },
      { type: "74HC04", label: "74HC04 (Hex NOT)" },
      { type: "74HC08", label: "74HC08 (Quad AND)" },
      { type: "74HC32", label: "74HC32 (Quad OR)" }
    ]
  }
];

// ── Prebuilt Circuits ─────────────────────────────────────────────────────────
const PREBUILT = {
  "blank": { nodes: [], wires: [] },
  "led_basic": {
    nodes: [
      { id: "n1", type: "POWER_SUPPLY", x: 1, y: -2, state: {} },
      { id: "n2", type: "RESISTOR", x: 5, y: 3, state: { value: 220, bands: ["#ef4444", "#ef4444", "#8b4513"] } },
      { id: "n3", type: "LED", x: 8, y: 2, state: {} }
    ],
    wires: [
      { id: "w1", h1: "rail_t1_5", h2: "strip_t_0_5", color: "#ef4444" },
      { id: "w2", h1: "rail_t2_9", h2: "strip_t_0_9", color: "#3b82f6" }
    ]
  },
  "555_astable": {
    nodes: [
      { id: "n1", type: "POWER_SUPPLY", x: 1, y: -2, state: {} },
      { id: "n_555", type: "555_TIMER", x: 10, y: 6, state: {} },
      { id: "n_r1", type: "RESISTOR", x: 5, y: 3, state: { value: 1000, bands: ["#8b4513", "#000000", "#ef4444"] } },
      { id: "n_r2", type: "RESISTOR", x: 9, y: 3, state: { value: 10000, bands: ["#8b4513", "#000000", "#f97316"] } },
      { id: "n_c", type: "CAPACITOR", x: 14, y: 9, state: { value: 0.0001 } },
      { id: "n_led", type: "LED", x: 18, y: 9, state: {} },
      { id: "n_r_led", type: "RESISTOR", x: 18, y: 12, state: { value: 220, bands: ["#ef4444", "#ef4444", "#8b4513"] } }
    ],
    wires: [
      // 555 Power
      { id: "w1", h1: "rail_t1_10", h2: "strip_t_0_10", color: "#ef4444" }, // VCC
      { id: "w2", h1: "rail_t2_10", h2: "strip_b_4_10", color: "#3b82f6" }, // GND
      { id: "w3", h1: "rail_t1_13", h2: "strip_t_0_13", color: "#ef4444" }, // RST to VCC
      // Astable R1, R2, C
      { id: "w4", h1: "rail_t1_5", h2: "strip_t_1_5", color: "#ef4444" }, // R1 to VCC
      { id: "w5", h1: "strip_t_1_8", h2: "strip_t_1_9", color: "#22c55e" }, // R1 to R2
      { id: "w6", h1: "strip_t_1_11", h2: "strip_t_1_9", color: "#22c55e" }, // R1/R2 to DISCH
      { id: "w7", h1: "strip_t_2_12", h2: "strip_b_0_14", color: "#eab308" }, // R2 to C
      { id: "w8", h1: "strip_t_3_12", h2: "strip_t_4_12", color: "#eab308" }, // THRES to C (bridge across trench internally)
      { id: "w8b", h1: "strip_t_4_12", h2: "strip_b_0_14", color: "#eab308" }, // THRES to C
      { id: "w9", h1: "strip_b_1_11", h2: "strip_b_0_14", color: "#eab308" }, // TRIG to C
      { id: "w10", h1: "strip_b_0_15", h2: "rail_b1_15", color: "#3b82f6" }, // C to GND
      // LED Output
      { id: "w11", h1: "strip_b_2_12", h2: "strip_b_2_18", color: "#a855f7" }, // OUT to LED anode
      { id: "w12", h1: "strip_b_3_19", h2: "strip_b_4_18", color: "#3b82f6" }, // LED cathode to R_LED
      { id: "w13", h1: "strip_b_4_21", h2: "rail_b1_21", color: "#3b82f6" } // R_LED to GND
    ]
  }
};

// ── Breadboard Layout ─────────────────────────────────────────────────────────
function getHoles(cols) {
  const holes = [];
  for (let c=0; c<cols; c++) {
    holes.push({ id: `rail_t1_${c}`, x: c, y: 0, netId: "rail_top_1" });
    holes.push({ id: `rail_t2_${c}`, x: c, y: 1, netId: "rail_top_2" });
  }
  for (let r=0; r<5; r++) {
    for (let c=0; c<cols; c++) {
      holes.push({ id: `strip_t_${r}_${c}`, x: c, y: 3 + r, netId: `strip_t_${c}` });
    }
  }
  for (let r=0; r<5; r++) {
    for (let c=0; c<cols; c++) {
      holes.push({ id: `strip_b_${r}_${c}`, x: c, y: 9 + r, netId: `strip_b_${c}` });
    }
  }
  for (let c=0; c<cols; c++) {
    holes.push({ id: `rail_b1_${c}`, x: c, y: 15, netId: "rail_bot_1" });
    holes.push({ id: `rail_b2_${c}`, x: c, y: 16, netId: "rail_bot_2" });
  }
  return holes;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LogicSim({ params = {} }) {
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);
  const stateRef  = useRef({
    nodes: [],
    wires: [],
    draggingWire: null,
    selectedNode: null,
    selectedWire: null,
    mouseX: 0, mouseY: 0,
    panX: 0, panY: 0, zoom: 1,
    simState: { voltages: null },
    netlist: null,
    _clickStart: null,
  });

  const [boardSize, setBoardSize] = useState(60);
  const bb_holes = useRef(getHoles(60));
  const [openDrawer, setOpenDrawer] = useState("Power & Switches");
  const [, forceRender] = useState(0);
  const dark = useIsDark();
  const C = getColors(dark);

  // Auto-center on load
  useEffect(() => {
    bb_holes.current = getHoles(boardSize);
    if (wrapRef.current) {
      const W = wrapRef.current.clientWidth;
      const H = wrapRef.current.clientHeight;
      const BB_W = boardSize * CELL;
      const BB_H = 17 * CELL;
      stateRef.current.panX = (W - BB_W)/2;
      stateRef.current.panY = (H - BB_H)/2 + 40;
    }
  }, [boardSize]);

  // ── Physics Ticker (60Hz Analog Simulation) ──
  useEffect(() => {
    let animId;
    const loop = () => {
      const st = stateRef.current;
      // Rebuild netlist if needed
      st.netlist = buildNetlist(st.nodes, st.wires, bb_holes.current);
      
      // Map node pins to nets for the solver
      st.nodes.forEach(n => {
        const def = COMP_DEFS[n.type];
        n.pinNets = def.pins.map(pin => {
          const hole = bb_holes.current.find(h => h.x === n.x + pin.x && h.y === n.y + pin.y);
          if (hole) return st.netlist.holeToNetIdx[hole.id];
          return undefined;
        });
      });

      // Step Analog Solver
      st.simState = solveAnalog(st.netlist, st.nodes, st.simState, 1/60);

      // Extract LED voltages for visual rendering
      st.nodes.forEach(n => {
        if (n.type === "LED") {
          const nA = n.pinNets[0];
          const nC = n.pinNets[1];
          const vA = nA !== undefined ? st.simState.voltages[nA] : 0;
          const vC = nC !== undefined ? st.simState.voltages[nC] : 0;
          n.state.voltageDiff = vA - vC;
        }
      });

      draw();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── Draw ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const st = stateRef.current;
    const { nodes, wires, draggingWire, panX, panY, zoom, selectedNode, selectedWire } = st;
    const BB_WIDTH = boardSize * CELL;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

    const tx = x => x * CELL * zoom + panX;
    const ty = y => y * CELL * zoom + panY;

    // Breadboard Body
    ctx.fillStyle = C.board;
    ctx.shadowColor = "rgba(0,0,0,0.1)"; ctx.shadowBlur = 20;
    ctx.fillRect(tx(-1), ty(-1), BB_WIDTH * zoom + 2*CELL*zoom, 17 * CELL * zoom + 2*CELL*zoom);
    ctx.shadowBlur = 0;

    // Power rail lines
    ctx.lineWidth = 3 * zoom;
    ctx.strokeStyle = C.railRed;
    ctx.beginPath(); ctx.moveTo(tx(0), ty(-0.5)); ctx.lineTo(tx(boardSize-1), ty(-0.5)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx(0), ty(16.5)); ctx.lineTo(tx(boardSize-1), ty(16.5)); ctx.stroke();
    ctx.strokeStyle = C.railBlue;
    ctx.beginPath(); ctx.moveTo(tx(0), ty(1.5)); ctx.lineTo(tx(boardSize-1), ty(1.5)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx(0), ty(14.5)); ctx.lineTo(tx(boardSize-1), ty(14.5)); ctx.stroke();

    // Trench
    ctx.fillStyle = C.bg;
    ctx.fillRect(tx(0), ty(8.2), BB_WIDTH*zoom, 0.6*CELL*zoom);

    // Holes
    bb_holes.current.forEach(h => {
      const px = tx(h.x) + CELL/2 * zoom;
      const py = ty(h.y) + CELL/2 * zoom;
      ctx.fillStyle = C.boardHole;
      ctx.beginPath(); ctx.arc(px, py, PORT_R * zoom, 0, Math.PI*2); ctx.fill();
    });

    // Wires
    wires.forEach(w => {
      const h1 = bb_holes.current.find(h => h.id === w.h1);
      const h2 = bb_holes.current.find(h => h.id === w.h2);
      if (!h1 || !h2) return;
      const px1 = tx(h1.x) + CELL/2 * zoom, py1 = ty(h1.y) + CELL/2 * zoom;
      const px2 = tx(h2.x) + CELL/2 * zoom, py2 = ty(h2.y) + CELL/2 * zoom;
      const isSel = selectedWire === w.id;
      
      ctx.strokeStyle = isSel ? C.sel : (w.color || C.wire);
      ctx.lineWidth = (isSel ? 5 : 3) * zoom;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(px1, py1);
      const dist = Math.hypot(px2-px1, py2-py1);
      ctx.quadraticCurveTo((px1+px2)/2, (py1+py2)/2 - dist/3, px2, py2);
      ctx.stroke();
      
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath(); ctx.arc(px1, py1, 6*zoom, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(px2, py2, 6*zoom, 0, Math.PI*2); ctx.fill();
    });

    // Dragging Wire
    if (draggingWire) {
      const h1 = bb_holes.current.find(h => h.id === draggingWire.h1);
      if (h1) {
        const px1 = tx(h1.x) + CELL/2 * zoom, py1 = ty(h1.y) + CELL/2 * zoom;
        ctx.strokeStyle = C.wireHi; ctx.lineWidth = 3 * zoom; ctx.setLineDash([5,5]);
        ctx.beginPath(); ctx.moveTo(px1, py1);
        const dist = Math.hypot(draggingWire.mx-px1, draggingWire.my-py1);
        ctx.quadraticCurveTo((px1+draggingWire.mx)/2, (py1+draggingWire.my)/2 - dist/3, draggingWire.mx, draggingWire.my);
        ctx.stroke(); ctx.setLineDash([]);
      }
    }

    // Nodes (Components)
    nodes.forEach(n => {
      const def = COMP_DEFS[n.type];
      const px = tx(n.x);
      const py = ty(n.y);
      const pw = def.w * CELL * zoom;
      const ph = def.h * CELL * zoom;
      
      ctx.save();
      if (selectedNode === n.id) {
        ctx.shadowColor = C.sel; ctx.shadowBlur = 15;
      }
      
      // Prepare pin inputs map if needed (like for 7-seg)
      const inputs = {};
      if (def.pins) {
         def.pins.forEach(p => {
             const net = n.pinNets ? n.pinNets[def.pins.indexOf(p)] : undefined;
             inputs[p.id] = net !== undefined ? simState.voltages[net] : 0;
         });
      }
      
      def.render(ctx, px, py, pw, ph, C, n.state || {}, inputs, simState);
      ctx.restore();
    });

  }, [C, boardSize]);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (canvasRef.current && wrapRef.current) {
        canvasRef.current.width  = wrapRef.current.clientWidth;
        canvasRef.current.height = wrapRef.current.clientHeight;
      }
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Interaction ──
  const getHoleAt = useCallback((mx, my) => {
    const st = stateRef.current;
    const sC = CELL * st.zoom;
    for (const h of bb_holes.current) {
      const px = h.x * sC + st.panX + sC/2;
      const py = h.y * sC + st.panY + sC/2;
      if (Math.hypot(mx - px, my - py) < 10 * st.zoom) return h;
    }
    return null;
  }, []);

  const getNodeAt = useCallback((mx, my) => {
    const st = stateRef.current;
    for (const n of [...st.nodes].reverse()) {
      const def = COMP_DEFS[n.type];
      const nx = n.x * CELL * st.zoom + st.panX;
      const ny = n.y * CELL * st.zoom + st.panY;
      const nw = def.w * CELL * st.zoom;
      const nh = def.h * CELL * st.zoom;
      if (mx >= nx && mx <= nx+nw && my >= ny && my <= ny+nh) {
         for (const pin of def.pins) {
            const px = (n.x + pin.x) * CELL * st.zoom + st.panX + (CELL/2)*st.zoom;
            const py = (n.y + pin.y) * CELL * st.zoom + st.panY + (CELL/2)*st.zoom;
            if (Math.hypot(mx - px, my - py) < 10 * st.zoom) return { node: n, pin: pin };
         }
         return { node: n, pin: null };
      }
    }
    return null;
  }, []);

  const onMouseDown = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const st = stateRef.current;
    st._clickStart = { x: mx, y: my };

    if (e.button === 1 || e.button === 4) {
      st._panning = true; st._panStartX = mx - st.panX; st._panStartY = my - st.panY; return;
    }

    const nodeHit = getNodeAt(mx, my);
    if (nodeHit) {
      if (nodeHit.pin) {
        const hole = getHoleAt(mx, my);
        if (hole) { st.draggingWire = { h1: hole.id, mx, my }; return; }
      } else {
        st.selectedNode = nodeHit.node.id;
        st.selectedWire = null;
        st._dragNode = nodeHit.node;
        st._dragOffX = mx - (nodeHit.node.x * CELL * st.zoom + st.panX);
        st._dragOffY = my - (nodeHit.node.y * CELL * st.zoom + st.panY);
        return;
      }
    }

    const hole = getHoleAt(mx, my);
    if (hole) {
      st.draggingWire = { h1: hole.id, mx, my };
      return;
    }

    st.selectedNode = null;
    st.selectedWire = null;
    st._panning = true; st._panStartX = mx - st.panX; st._panStartY = my - st.panY;
  }, [getHoleAt, getNodeAt]);

  const onMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const st = stateRef.current;
    
    if (st._panning) { st.panX = mx - st._panStartX; st.panY = my - st._panStartY; return; }
    if (st.draggingWire) { st.draggingWire.mx = mx; st.draggingWire.my = my; return; }
    if (st._dragNode) {
      const gx = Math.round((mx - st._dragOffX - st.panX) / (CELL * st.zoom));
      const gy = Math.round((my - st._dragOffY - st.panY) / (CELL * st.zoom));
      st._dragNode.x = gx; st._dragNode.y = gy;
    }
  }, []);

  const onMouseUp = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const st = stateRef.current;
    const isClick = Math.hypot(mx - (st._clickStart?.x || mx), my - (st._clickStart?.y || my)) < 5;

    if (st.draggingWire) {
      const hole = getHoleAt(mx, my);
      if (hole && hole.id !== st.draggingWire.h1) {
        const colors = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#e2e8f0"];
        st.wires.push({ id: "w"+Date.now(), h1: st.draggingWire.h1, h2: hole.id, color: colors[Math.floor(Math.random()*colors.length)] });
      }
      st.draggingWire = null;
    } else if (st._dragNode && isClick) {
      const n = st._dragNode;
      if (n.type === "SWITCH") {
        n.state = { on: !n.state?.on };
      } else if (n.type === "DIP_SWITCH") {
        const localX = mx - (n.x * CELL * st.zoom + st.panX);
        const col = Math.floor(localX / (CELL * st.zoom));
        if (col >= 0 && col < 4) {
          const sw = n.state?.switches ? [...n.state.switches] : [false,false,false,false];
          sw[col] = !sw[col];
          n.state = { ...n.state, switches: sw };
        }
      } else if (n.type === "POTENTIOMETER") {
        let val = n.state?.value ?? 0.5;
        val = (val + 0.25) > 1.0 ? 0.0 : val + 0.25;
        n.state = { ...n.state, value: val };
      } else if (n.type === "PHOTORESISTOR") {
        let light = n.state?.light ?? 0.5;
        light = light === 0.5 ? 1.0 : (light === 1.0 ? 0.0 : 0.5);
        n.state = { ...n.state, light: light };
      }
    }

    st._dragNode = null;
    st._panning = false;
  }, [getHoleAt]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("application/json"));
    if (!COMP_DEFS[data.type]) return;
    
    const rect = wrapRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const st = stateRef.current;
    const def = COMP_DEFS[data.type];
    
    const dropX = Math.round((mx - st.panX) / (CELL * st.zoom)) - Math.floor(def.w / 2);
    const dropY = Math.round((my - st.panY) / (CELL * st.zoom)) - Math.floor(def.h / 2);

    st.nodes.push({ id: "n" + Date.now(), type: data.type, x: dropX, y: dropY, state: data.state || {} });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        const st = stateRef.current;
        if (st.selectedNode) st.nodes = st.nodes.filter(n => n.id !== st.selectedNode);
        if (st.selectedWire) st.wires = st.wires.filter(w => w.id !== st.selectedWire);
        st.selectedNode = null; st.selectedWire = null;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadPrebuilt = (key) => {
    const p = PREBUILT[key];
    if (p) {
      // Deep clone to avoid mutating preset
      stateRef.current.nodes = JSON.parse(JSON.stringify(p.nodes));
      stateRef.current.wires = JSON.parse(JSON.stringify(p.wires));
      stateRef.current.simState = { voltages: null };
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 dark:bg-slate-950 font-sans relative">
      {/* ── Top Toolbar ── */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center px-4 shrink-0 gap-4">
        <select className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-sm px-3 py-1.5 outline-none text-slate-800 dark:text-slate-200"
                onChange={e => loadPrebuilt(e.target.value)}>
          <option value="blank">Empty Board</option>
          <option value="led_basic">Basic LED Circuit</option>
          <option value="555_astable">555 Astable Oscillator</option>
        </select>
        
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Board Size:</label>
          <select className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-sm px-3 py-1.5 outline-none text-slate-800 dark:text-slate-200" 
                  value={boardSize} onChange={e => setBoardSize(parseInt(e.target.value))}>
            <option value={30}>Half-Size (30)</option>
            <option value={60}>Full-Size (60)</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ── Accordion Drawers ── */}
        <div className="w-72 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 z-10 flex-shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Maker Kit Drawers</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Drag components onto the breadboard. Press Delete to remove.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {DRAWERS.map((drawer) => (
              <div key={drawer.title} className="border-b border-slate-200 dark:border-slate-800">
                <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        onClick={() => setOpenDrawer(openDrawer === drawer.title ? null : drawer.title)}>
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{drawer.title}</span>
                  {openDrawer === drawer.title ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                </button>
                {openDrawer === drawer.title && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 flex flex-col gap-2">
                    {drawer.items.map((item, idx) => (
                      <div key={idx} draggable
                           onDragStart={e => e.dataTransfer.setData("application/json", JSON.stringify({ type: item.type, state: item.state }))}
                           className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded cursor-grab hover:border-sky-400 hover:shadow-sm transition-all text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Canvas Area ── */}
        <div className="flex-1 relative outline-none cursor-crosshair" 
             ref={wrapRef} onDrop={onDrop} onDragOver={e => e.preventDefault()} tabIndex={0}>
          <canvas ref={canvasRef}
            className="w-full h-full block"
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onWheel={(e) => {
              e.preventDefault();
              const st = stateRef.current;
              const mx = e.clientX - canvasRef.current.getBoundingClientRect().left;
              const my = e.clientY - canvasRef.current.getBoundingClientRect().top;
              if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                const zoomDelta = e.deltaY > 0 ? 0.95 : 1.05;
                const newZoom = Math.max(0.2, Math.min(3.0, st.zoom * zoomDelta));
                st.panX = mx - (mx - st.panX) / st.zoom * newZoom;
                st.panY = my - (my - st.panY) / st.zoom * newZoom;
                st.zoom = newZoom;
              } else {
                st.panX -= e.deltaX; st.panY -= e.deltaY;
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
