import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OpenMatStudio from "../components/tools/OpenMatStudio.jsx";

export default function OpenMatPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-5 py-3 backdrop-blur shrink-0">
        <div className="min-w-0">
          <h1 className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
            OpenMAT
          </h1>
          <p className="truncate text-xs text-slate-400">
            Full-screen MATLAB-style workspace for open-calc
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
          title="Close OpenMAT"
        >
          <X className="h-4 w-4" />
          Close
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-4 md:px-5">
        <OpenMatStudio />
      </div>
    </div>
  );
}
