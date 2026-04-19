import OpenMatStudio from "../components/tools/OpenMatStudio.jsx";

export default function OpenMatPage() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white dark:bg-slate-950">
      <div className="min-h-0 flex-1 overflow-hidden">
        <OpenMatStudio />
      </div>
    </div>
  );
}
