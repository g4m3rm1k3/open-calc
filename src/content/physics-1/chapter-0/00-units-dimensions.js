import React from 'react'
import KatexBlock from '../../../components/math/KatexBlock'
import KatexInline from '../../../components/math/KatexInline'
import Callout from '../../../components/ui/Callout'

export const content = (
  <div className="space-y-8">
    <section>
      <h2 className="text-2xl font-bold mb-4">Physics: Models of Reality</h2>
      <p>
        Physics is not about memorizing equations; it's about building **mathematical models** that describe how the universe behaves. 
        Before we dive into motion and forces, we must establish the rules of the game: **Units, Dimensions, and Scaling.**
      </p>
    </section>

    <Callout type="idea" title="The Golden Rule of Dimensions">
      You cannot add apples to oranges. In physics, you cannot add 5 meters to 10 seconds. 
      Every equation must be **dimensionally homogeneous**—meaning the units on the left must match the units on the right.
    </Callout>

    <section>
      <h3 className="text-xl font-bold mb-3">SI Base Units</h3>
      <p>The International System of Units (SI) defines the foundations:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Length:</strong> Meter (m)</li>
        <li><strong>Mass:</strong> Kilogram (kg)</li>
        <li><strong>Time:</strong> Second (s)</li>
      </ul>
    </section>

    <section>
      <h3 className="text-xl font-bold mb-3">Derived Units & Scaling</h3>
      <p>
        Velocity is distance over time ($v = d/t$), so its units are $m/s$. 
        Acceleration is change in velocity over time, so its units are $m/s^2$.
      </p>
      <KatexBlock>
        Force = \text{mass} \times \text{acceleration} \implies [kg] \times [m/s^2] = [N] \text{ (Newton)}
      </KatexBlock>
    </section>

    <section className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-bold mb-2">Interactive: Scaling Laws</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        If you double the length of a cube, its surface area quadruples ($2^2$), but its volume octuples ($2^3$). 
        This is why giant ants can't exist—their legs would snap under their own volume-scaled weight!
      </p>
      {/* TODO: Add ScalingSlider component here */}
      <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
        [Scaling Simulation Placeholder]
      </div>
    </section>
  </div>
)

export const checkpoints = [
  { id: 'dim-1', type: 'multiple-choice', question: 'Which of these is a valid unit for acceleration?', options: ['m/s', 'm*s', 'm/s^2', 'kg*m/s'], correct: 2 },
  { id: 'dim-2', type: 'multiple-choice', question: 'If [L] is length and [T] is time, what are the dimensions of speed?', options: ['[L][T]', '[L]/[T]', '[L]/[T]^2', '[T]/[L]'], correct: 1 }
]
