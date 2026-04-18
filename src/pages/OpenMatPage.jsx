import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OpenMatStudio from "../components/tools/OpenMatStudio.jsx";

export default function OpenMatPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white dark:bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur shrink-0 dark:border-slate-800 dark:bg-slate-950/95">
        <div className="min-w-0">
          <h1 className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">
            OpenMAT R3
          </h1>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
            MATLAB-style desktop workspace inside open-calc
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Close OpenMAT"
        >
          <X className="h-4 w-4" />
          Close
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-2 md:p-3">
        <OpenMatStudio />
      </div>
    </div>
  );
}
