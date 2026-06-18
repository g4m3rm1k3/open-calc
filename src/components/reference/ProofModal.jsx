import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ProofViewer from "./ProofViewer.jsx";

export default function ProofModal({ entry, proof, onClose }) {
  const scrollRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    function handler(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0px",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="proof-panel">
        {/* Floating close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all hover:rotate-90"
          aria-label="Close proof"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Scrollable proof body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-4 pb-4">
          <ProofViewer proof={proof} />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
