export default {
  id:'b-02',slug:'plotting-foundations',track:'B',order:2,
  title:'Plotting and Visualization Foundations',subtitle:'Turning Numbers into Pictures',
  tags:['visualization','opencalc','plot','scatter','histogram','figure'],
  prereqs:['b-01'],unlocks:['b-03','b-04'],
  hook:{
    question:'What does a distribution LOOK like — and why does looking matter?',
    realWorldContext:`The same data that reveals nothing as a table of numbers becomes obvious as a histogram. Anscombe's quartet: four datasets with identical mean, variance, and correlation — but completely different when plotted. Always plot your data before computing with it.`
  },
  intuition:{
    prose:['Visualization is not decoration. It is a tool for finding structure that arithmetic hides. The first thing any data scientist does with a new dataset is plot it.',
      'The **opencalc Figure API** gives you precise control over every element: curves, scatter plots, histograms, arrows, annotations. Unlike matplotlib, every Figure uses your theme colors and dark mode automatically.',
      'Three questions drive visualization: **What is the distribution?** (histogram). **How do two variables relate?** (scatter). **How does a value change?** (line plot). Every other plot is a variation on these three.'],
    callouts:[{type:'important',title:'The Figure API Pattern',body:`fig = Figure(xmin=-4, xmax=4, ymin=-2, ymax=10)
fig.grid()           # coordinate grid
fig.axes()           # x and y axes
fig.plot(fn)         # function curve
fig.scatter(xs, ys)  # data points
fig.show()           # ← last line, returns JSON`}],
    visualizations:[{id:'PythonNotebook',title:'Visualization Lab',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — First Plot',prose:'Plot a mathematical function with one line.',instructions:'Run the cell. Then change the function and run again.',code:`from opencalc import Figure

fig = Figure(xmin=-4, xmax=4, ymin=-2, ymax=16, title="y = x²")
fig.grid()
fig.axes()
fig.plot(lambda x: x**2, color="blue", label="x²")
fig.show()`},
      {id:2,cellTitle:'Stage 2 — Overlaying Functions',prose:'Multiple curves on the same Figure reveal relationships.',instructions:'Run. Notice how the growth rates diverge for large x.',code:`from opencalc import Figure
import math

fig = Figure(xmin=0, xmax=4, ymin=0, ymax=20, title="Growth comparison")
fig.grid().axes()
fig.plot(lambda x: x, color="blue", label="x")
fig.plot(lambda x: x**2, color="amber", label="x²")
fig.plot(lambda x: math.exp(x), color="red", label="eˣ")
fig.show()`},
      {id:3,cellTitle:'Stage 3 — Scatter Plot',prose:'Scatter plots reveal relationships between two variables.',instructions:'Run. Notice the positive correlation between x and y (with noise).',code:`from opencalc import Figure
import numpy as np

np.random.seed(42)
xs = np.linspace(0, 10, 30)
ys = 2*xs + 1 + np.random.normal(0, 2, 30)  # linear + noise

fig = Figure(xmin=-1, xmax=11, ymin=-5, ymax=25)
fig.grid().axes()
fig.scatter(xs.tolist(), ys.tolist(), color="blue", radius=4)
fig.plot(lambda x: 2*x+1, color="amber", label="true line")
fig.show()`},
      {id:4,cellTitle:'Stage 4 — Fill Between (Area)',prose:'Highlight regions — useful for integrals, confidence intervals.',instructions:'Run. The shaded area represents the integral from 0 to 3.',code:`from opencalc import Figure

fig = Figure(xmin=-1, xmax=5, ymin=-1, ymax=10, title="Area under x²")
fig.grid().axes()
fig.plot(lambda x: x**2, color="blue")
fig.fill_between(lambda x: x**2, xmin=0, xmax=3, color="blue", alpha=0.25)
fig.vline(3, color="amber")
fig.text([3.1, 1], "x = 3", color="amber", align="left")
fig.show()`},
      {id:5,cellTitle:'Stage 5 — Tangent and Annotation',prose:'Annotate specific points — slopes, critical values, intersections.',instructions:'Run. The tangent at x=2 shows the derivative graphically.',code:`from opencalc import Figure

fig = Figure(xmin=-1, xmax=5, ymin=-2, ymax=20)
fig.grid().axes()
fig.plot(lambda x: x**2, color="blue", label="x²")
fig.tangent(lambda x: x**2, x0=2, color="amber", length=3)
fig.point([2,4], color="amber", label="(2,4)")
fig.show()`},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — sin and cos Overlay',difficulty:'easy',
        prompt:'Plot sin(x) and cos(x) on the same Figure from -2π to 2π. Mark the point where they first intersect (at x=π/4, y=√2/2). Use different colors for each curve.',
        instructions:`1. import math. 2. Figure with xmin=-6.5, xmax=6.5, ymin=-1.5, ymax=1.5.
3. Plot sin and cos. 4. Add a point at (π/4, √2/2).`,
        code:`from opencalc import Figure
import math
# Your code here
`,
        testCode:`
res="SUCCESS: sin and cos plotted with intersection marked. The first intersection is at x=π/4 where sin=cos=√2/2≈0.707."
res
`,hint:`fig=Figure(xmin=-6.5,xmax=6.5,ymin=-1.5,ymax=1.5)
fig.grid().axes()
fig.plot(math.sin,color="blue",label="sin")
fig.plot(math.cos,color="amber",label="cos")
fig.point([math.pi/4,math.sqrt(2)/2],color="green",label="intersection")
fig.show()`},
      {id:12,challengeType:'write',challengeNumber:2,challengeTitle:'Challenge 2 — Riemann Sum',difficulty:'medium',
        prompt:'Plot f(x)=x² and a Riemann sum approximation of its integral from 0 to 3 using 10 midpoint rectangles. Show both on the same Figure.',
        instructions:`1. Plot the curve. 2. Use fig.riemann(fn, a, b, n, method="midpoint"). 3. The exact integral is 9.`,
        code:`from opencalc import Figure
# Your code here
`,
        testCode:`
res="SUCCESS: Riemann sum with 10 midpoint rectangles. As n→∞ this approximation approaches 9 (the exact integral of x² from 0 to 3)."
res
`,hint:`fig=Figure(xmin=-0.5,xmax=4,ymin=-1,ymax=10)
fig.grid().axes()
fig.plot(lambda x:x**2,color="blue")
fig.riemann(lambda x:x**2,0,3,10,method="midpoint",color="blue")
fig.show()`},
    ]}}],
  },
  mentalModel:['Always plot data before computing statistics.','fig = Figure() → .grid() → .axes() → drawing calls → .show()','fig.plot(fn) for function curves. fig.scatter(xs,ys) for data points.','fig.fill_between(fn_top, fn_bottom) for regions.','fig.tangent(fn, x0) computes slope numerically and draws the line.'],
}