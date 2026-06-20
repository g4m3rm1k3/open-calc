import RealityRunner from "./RealityRunner.jsx";

export default function RealityRunnerPage({ onClose, onBack }) {
  return <RealityRunner onClose={onClose || onBack} />;
}
