import HashOutput from './HashOutput.jsx'
import AvalancheDiff from './AvalancheDiff.jsx'
import DictionaryAttack from './DictionaryAttack.jsx'
import CollisionDemo from './CollisionDemo.jsx'
import RegistrationLoginFlow from './RegistrationLoginFlow.jsx'
import PBKDF2CostDemo from './PBKDF2CostDemo.jsx'

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h4 className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
        {title}
      </h4>
      {children}
    </div>
  )
}

// A "everything in one place" composition of the standalone primitives
// below — each one (HashOutput, AvalancheDiff, DictionaryAttack,
// CollisionDemo, RegistrationLoginFlow, PBKDF2CostDemo) is also its own
// independently viz-registered file, so a future lesson can embed just the
// one piece it needs instead of this whole composed lab.
export default function PasswordHashingLab() {
  return (
    <div>
      <Section title="1. How a real login actually works">
        <RegistrationLoginFlow />
      </Section>
      <Section title="2. Hash something yourself">
        <HashOutput params={{}} />
      </Section>
      <Section title="3. The avalanche effect">
        <AvalancheDiff params={{}} />
      </Section>
      <Section title="4. Why salt matters — attack a precomputed table">
        <DictionaryAttack params={{}} />
      </Section>
      <Section title="5. A real MD5 collision">
        <CollisionDemo />
      </Section>
      <Section title="6. Why iteration count matters — a real cost factor">
        <PBKDF2CostDemo params={{}} />
      </Section>
    </div>
  )
}
