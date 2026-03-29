import L001 from './p8-001-hookes-law.js'
import L002 from './p8-002-shm.js'
import L003 from './p8-003-wave-properties.js'
import L004 from './p8-004-wave-equation.js'

const CH8 = {
  number: 'p8',
  id: 'p8',
  course: 'physics',
  title: 'Oscillations & Waves',
  slug: 'chapter-p8',
  description:
    'Hooke\'s Law produces a restoring force. ' +
    'That restoring force creates Simple Harmonic Motion — the most important oscillation in physics. ' +
    'SHM propagating through space becomes a wave, governed by the wave equation ∂²y/∂t² = v²∂²y/∂x². ' +
    'Sound, light, strings, and quantum matter all obey the same mathematics.',
  lessons: [L001, L002, L003, L004],
}

export default CH8
