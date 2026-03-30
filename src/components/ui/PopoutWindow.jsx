import React, { useRef, useState } from "react";

export default function PopoutWindow({ title = "Output", children, onClose }) {
  const [pos, setPos] = useState({ x: 120, y: 120 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: 300 });
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 400,
    height: 300,
  });
  const windowRef = useRef(null);

  const onMouseDown = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };

  const onMouseMove = (e) => {
    if (dragging) {
      setPos({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    } else if (resizing) {
      setSize({
        width: Math.max(320, resizeStart.width + (e.clientX - resizeStart.x)),
        height: Math.max(120, resizeStart.height + (e.clientY - resizeStart.y)),
      });
    }
  };

  const onMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  const onResizeMouseDown = (e) => {
    e.stopPropagation();
    setResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  React.useEffect(() => {
    if (dragging || resizing) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }
  });

  return (
    <div
      ref={windowRef}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 2000,
        minWidth: 320,
        minHeight: 120,
        width: size.width,
        height: size.height,
        background: "#181e2a",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        border: "1px solid #334155",
        color: "#fff",
        userSelect: dragging || resizing ? "none" : "auto",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          cursor: "move",
          padding: "0.5rem 1rem",
          borderBottom: "1px solid #334155",
          background: "#232946",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        onMouseDown={onMouseDown}
      >
        <span style={{ fontWeight: 600 }}>{title}</span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
            marginLeft: 8,
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div
        style={{ padding: "1rem", height: size.height - 56, overflow: "auto" }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 18,
          height: 18,
          cursor: "nwse-resize",
          zIndex: 10,
          background: "none",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
        }}
        onMouseDown={onResizeMouseDown}
      >
        <svg width="18" height="18" style={{ opacity: 0.5 }}>
          <polyline
            points="4,18 18,18 18,4"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
