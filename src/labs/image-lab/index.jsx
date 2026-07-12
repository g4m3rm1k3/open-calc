import ImageLab from './ImageLab.jsx'

export const meta = {
  label: 'Image Lab',
  emoji: '▧',
  color: 'cyan',
  kind: 'lab',
  subject: 'Math',
  desc: 'A MATLAB-like image workspace for seeing what matrix operations do to real pixels: inspect RGB values, split channels, tune histograms, design kernels, compare errors, and log reproducible experiments.',
  tags: ['Math', 'Images', 'Linear Algebra', 'Computer Vision', 'Matrices', 'OpenMAT', 'FFT'],
  cover: { grad: 'from-cyan-700 via-teal-800 to-slate-950', mark: 'px=Aij', sub: 'Pixels · Kernels · OpenMAT' },
}

export default function ImageLabEntry({ onBack }) {
  return (
    <div className="h-full w-full overflow-hidden">
      <ImageLab onBack={onBack} />
    </div>
  )
}
