import React, { useRef, useState } from "react";

export default function PopoutWindow({ title = "Output", children, onClose }) {
  const [pos, setPos] = useState({ x: 120, y: 120 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  const onMouseDown = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setPos({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const onMouseUp = () => setDragging(false);

  React.useEffect(() => {
    if (dragging) {
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
        background: "#181e2a",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        border: "1px solid #334155",
        color: "#fff",
        userSelect: dragging ? "none" : "auto",
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
      <div style={{ padding: "1rem", maxHeight: 400, overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}
