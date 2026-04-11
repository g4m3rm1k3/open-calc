import { Suspense, lazy } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";

const PhysicsLab = lazy(() => import("../components/tools/PhysicsLab.jsx"));

export default function PhysicsPage({ onClose }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "48px 1fr",
        gridTemplateColumns: "220px 1fr",
        gridTemplateAreas: "'header header' 'sidebar main'",
        width: "100vw",
        height: "100vh",
        background: "#0b0e12",
        color: "#d4dde8",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        fontSize: "13px",
        lineHeight: "1.5",
      }}
    >
      <Suspense
        fallback={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <PhysicsLab onClose={onClose} />
      </Suspense>
    </div>
  );
}
