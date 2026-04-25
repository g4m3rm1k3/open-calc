import OpenCraftStudio from "../components/tools/OpenCraftStudio.jsx";

export default function OpenCraftPage() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#060b12]">
      <div className="min-h-0 flex-1 overflow-hidden">
        <OpenCraftStudio />
      </div>
    </div>
  );
}
