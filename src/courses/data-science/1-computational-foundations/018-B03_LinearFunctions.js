export default {
  id:'b-03',slug:'linear-functions-and-slope',track:'B',order:3,
  title:'Linear Functions and Slope',subtitle:'The Simplest Relationship',
  tags:['linear','slope','intercept','residuals','least-squares'],
  prereqs:['b-02','a-08'],unlocks:['b-04','b-05','c-02'],
  hook:{question:'What does a rate of change look like — and how do you find it from data?',realWorldContext:'Linear relationships are the foundation of everything in data science. Linear regression, neural network layers, PCA — all are built from linear operations. Before you can understand any of them, you need an intuitive grasp of slope and intercept as physical concepts.'},
  intuition:{
    prose:['y = mx + b. **m** is slope: how much y changes per unit increase in x. **b** is intercept: the value of y when x is 0. These are not just formula elements — they have physical meaning in every application.',
      '**Residuals** are the vertical distances from data points to the line. A good fit has small residuals with no pattern. If residuals show a curve or trend, the linear model is wrong for that data.',
      'The **least squares** solution minimizes the sum of squared residuals. This is the unique line that minimizes prediction error. The formula is not magic — it comes from setting the derivative of total squared error to zero and solving.'],
    callouts:[{type:'important',title:'Slope as Rate',body:`If x is time (hours) and y is distance (km):
  slope = km per hour = speed

If x is study hours and y is test score:
  slope = score points gained per hour of study

The slope always has units: y-units per x-unit.`}],
    visualizations:[{id:'PythonNotebook',title:'Linear Functions and Fitting',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Slope and Intercept',prose:'Explore how m and b change the line.',instructions:'Run. Then change m and b and observe the effect.',code:`from opencalc import Figure

m, b = 2, 1
fig = Figure(xmin=-3, xmax=3, ymin=-5, ymax=8, title=f"y = {m}x + {b}")
fig.grid().axes()
fig.plot(lambda x: m*x + b, color="blue", label=f"m={m}, b={b}")
fig.hline(0, color="hint")
fig.show()`},
      {id:2,cellTitle:'Stage 2 — Slope from Two Points',prose:'Slope = (y2-y1)/(x2-x1). Rise over run.',instructions:'Run. Then change the two points and observe the slope change.',code:`from opencalc import Figure

x1, y1 = 1, 3
x2, y2 = 4, 9
m = (y2 - y1) / (x2 - x1)
b = y1 - m * x1
print(f"slope = {m:.2f}, intercept = {b:.2f}")

fig = Figure(xmin=-1, xmax=6, ymin=-1, ymax=12)
fig.grid().axes()
fig.plot(lambda x: m*x+b, color="blue")
fig.point([x1,y1], color="amber", label="P1")
fig.point([x2,y2], color="amber", label="P2")
fig.show()`},
      {id:3,cellTitle:'Stage 3 — Residuals',prose:'Residuals are the vertical gap between data points and the line.',instructions:'Run. The dashed lines are residuals. Large residuals = poor fit.',code:`from opencalc import Figure
import numpy as np

xs = np.array([1,2,3,4,5])
ys = np.array([2.1, 3.9, 6.2, 7.8, 10.1])
m, b = 2, 0  # try to fit by eye

fig = Figure(xmin=0, xmax=6, ymin=0, ymax=12)
fig.grid().axes()
fig.scatter(xs.tolist(), ys.tolist(), color="blue")
fig.plot(lambda x: m*x+b, color="amber")
for xi, yi in zip(xs, ys):
    predicted = m*xi + b
    fig.line([xi,yi],[xi,predicted],color="red",dashed=True)
fig.show()`},
      {id:4,cellTitle:'Stage 4 — Least Squares with NumPy',prose:'np.polyfit() finds the best-fit line by minimizing squared residuals.',instructions:'Run. The fitted line is the unique line minimizing total squared error.',code:`import numpy as np
from opencalc import Figure

xs = np.array([1.0,2,3,4,5,6,7,8])
ys = np.array([2.1,3.8,5.9,8.2,9.8,12.1,14.3,16.0])

coeffs = np.polyfit(xs, ys, 1)  # degree 1 = linear
m, b = coeffs
print(f"Best fit: y = {m:.3f}x + {b:.3f}")

fig = Figure(xmin=0, xmax=9, ymin=0, ymax=18)
fig.grid().axes()
fig.scatter(xs.tolist(), ys.tolist(), color="blue")
fig.plot(lambda x: m*x+b, color="amber", label=f"y={m:.2f}x+{b:.2f}")
fig.show()`},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Manual Least Squares',difficulty:'hard',
        prompt:'Implement least squares WITHOUT using np.polyfit. Use the normal equations: m = (n*Σxy - Σx*Σy) / (n*Σx² - (Σx)²), b = (Σy - m*Σx) / n. Store m and b.',
        instructions:`1. Compute the sums: sum_x, sum_y, sum_xy, sum_x2.
2. Apply the formulas.
3. Verify your m and b match np.polyfit.`,
        code:`import numpy as np

xs = np.array([1.0,2,3,4,5])
ys = np.array([2.0,4.1,5.9,8.2,10.0])
n = len(xs)
# Your code here
m = 
b = 
print(f"m={m:.4f}, b={b:.4f}")
print(f"polyfit: {np.polyfit(xs,ys,1)}")`,
        testCode:`
import numpy as np
xs=np.array([1.0,2,3,4,5])
ys=np.array([2.0,4.1,5.9,8.2,10.0])
expected_m,expected_b=np.polyfit(xs,ys,1)
if abs(m-expected_m)>0.01: raise ValueError(f"m should be {expected_m:.4f}, got {m}")
if abs(b-expected_b)>0.01: raise ValueError(f"b should be {expected_b:.4f}, got {b}")
res=f"SUCCESS: m={m:.4f}, b={b:.4f}. Normal equations implemented from scratch."
res
`,hint:`sum_x=np.sum(xs);sum_y=np.sum(ys);sum_xy=np.sum(xs*ys);sum_x2=np.sum(xs**2)
m=(n*sum_xy-sum_x*sum_y)/(n*sum_x2-sum_x**2)
b=(sum_y-m*sum_x)/n`},
    ]}}],
  },
  mentalModel:['y=mx+b: m=slope (rate of change), b=intercept (y when x=0).','Slope = (y2-y1)/(x2-x1). Units: y-units per x-unit.','Residual = actual - predicted. Good fit: small, random residuals.','Least squares: find m,b minimizing sum of squared residuals.','np.polyfit(xs,ys,1) gives [m,b] of best-fit line.'],
}