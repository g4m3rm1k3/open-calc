export default {
  id:'d-05',slug:'gradient-descent',track:'D',order:5,
  title:'Gradient Descent and Optimization',subtitle:'How Models Learn',
  tags:['gradient-descent','optimization','learning-rate','loss-function','convergence'],
  prereqs:['d-03','b-04'],unlocks:['d-06'],
  hook:{question:'How does a model actually learn from data?',realWorldContext:'Gradient descent is the algorithm behind all deep learning. Every weight update in a neural network is gradient descent. Understanding it at the simplest level — minimizing a quadratic — gives you the intuition for every optimizer in every framework.'},
  intuition:{
    prose:[
      'Gradient descent: compute the gradient of the loss function (the direction of steepest increase), step in the opposite direction. Repeat. The **learning rate** controls step size. Too large: oscillates or diverges. Too small: converges but slowly.',
      'For linear regression: loss = Σ(y - (mx+b))². Gradient with respect to m: -2Σx(y-(mx+b)). Gradient with respect to b: -2Σ(y-(mx+b)). Update: m -= lr × gradient_m. This is batch gradient descent.',
      'The **loss curve** shows loss vs iterations. It should decrease monotonically and flatten. If it oscillates, the learning rate is too high. If it decreases very slowly, the learning rate is too low.',
    ],
    callouts:[{type:'important',title:'Learning Rate Selection',body:'Too high: steps overshoot minimum, loss oscillates or diverges\nToo low: converges but very slowly, wastes computation\nJust right: smooth, monotonic decrease, converges in reasonable steps\n\nRule of thumb: try 0.1, 0.01, 0.001. Watch the loss curve.\nIf oscillating → divide by 10. If too slow → multiply by 10.'}],
    visualizations:[{id:'PythonNotebook',title:'Gradient Descent',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Minimizing a Simple Function',
       prose:'Start at a point. Compute the gradient. Step downhill. Repeat.',
       instructions:'Run. Watch how the algorithm walks toward the minimum.',
       code:'from opencalc import Figure\nimport numpy as np\nf = lambda x: x**2 + 2*x + 1  # minimum at x=-1\ndf = lambda x: 2*x + 2        # gradient\nx = 4.0  # start far from minimum\nlr = 0.1\npath_x, path_y = [x], [f(x)]\nfor _ in range(20):\n    x -= lr * df(x)\n    path_x.append(x)\n    path_y.append(f(x))\nfig = Figure(xmin=-3,xmax=5,ymin=0,ymax=25,title="Gradient descent on x²+2x+1")\nfig.grid().axes()\nfig.plot(f,color="blue")\nfig.scatter(path_x,path_y,color="amber",radius=4)\nfig.show()',output:'',status:'idle'},
      {id:2,cellTitle:'Stage 2 — Gradient Descent for Linear Regression',
       prose:'Update m and b by gradient descent instead of the normal equations.',
       instructions:'Run. Compare final m and b to the normal equation solution.',
       code:'import numpy as np\nnp.random.seed(42)\nxs = np.random.uniform(0,10,50)\nys = 2.5*xs + 1.0 + np.random.normal(0,2,50)\nm, b = 0.0, 0.0\nlr = 0.001\nlosses = []\nfor _ in range(500):\n    y_pred = m*xs + b\n    residuals = ys - y_pred\n    grad_m = -2*np.mean(xs*residuals)\n    grad_b = -2*np.mean(residuals)\n    m -= lr*grad_m\n    b -= lr*grad_b\n    losses.append(np.mean(residuals**2))\nprint(f"GD result: m={m:.4f}, b={b:.4f}")\nprint(f"Polyfit:   m={np.polyfit(xs,ys,1)[0]:.4f}, b={np.polyfit(xs,ys,1)[1]:.4f}")',output:'',status:'idle'},
      {id:3,cellTitle:'Stage 3 — Learning Rate Effect',
       prose:'Three learning rates: too high, too low, just right.',
       instructions:'Run. Watch how the loss curves differ.',
       code:'from opencalc import Figure\nimport numpy as np\nnp.random.seed(42)\nxs=np.random.uniform(0,5,30);ys=2*xs+1+np.random.normal(0,1,30)\nfig=Figure(xmin=0,xmax=200,ymin=0,ymax=50,title="Loss vs iterations for different learning rates")\nfig.grid().axes()\nfor lr,color,label in [(0.001,"blue","lr=0.001 (slow)"),(0.01,"green","lr=0.01 (good)"),(0.1,"red","lr=0.1 (too high)")]:\n    m=b=0.0;losses=[]\n    for _ in range(200):\n        yp=m*xs+b;r=ys-yp\n        m-=lr*(-2*np.mean(xs*r));b-=lr*(-2*np.mean(r))\n        losses.append(min(np.mean(r**2),50))\n    fig.scatter(list(range(200)),losses,color=color,radius=2)\nfig.show()',output:'',status:'idle'},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Implement from Scratch',
       difficulty:'hard',
       prompt:'Implement gradient descent for linear regression on the given data. Run for 1000 iterations with learning rate 0.01. Store final m, b, and the final loss (MSE).',
       instructions:'1. Initialize m=0, b=0.\n2. For each iteration: compute predictions, residuals, gradients, update m and b.\n3. Final loss = mean squared residuals.',
       code:'import numpy as np\nnp.random.seed(42)\nxs = np.array([1.0,2,3,4,5,6,7,8,9,10])\nys = np.array([2.1,4.0,5.9,8.2,9.8,12.0,14.1,16.2,17.9,20.1])\nm = 0.0\nb = 0.0\nlr = 0.01\n# Your gradient descent loop here\nfinal_loss = \nprint(f"m={m:.4f}, b={b:.4f}, MSE={final_loss:.4f}")\n',output:'',status:'idle',
       testCode:`
import numpy as np
xs=np.array([1.0,2,3,4,5,6,7,8,9,10]);ys=np.array([2.1,4.0,5.9,8.2,9.8,12.0,14.1,16.2,17.9,20.1])
em,eb=np.polyfit(xs,ys,1)
if abs(m-em)>0.1: raise ValueError(f"m should be ~{em:.4f}, got {m:.4f}")
if abs(b-eb)>0.3: raise ValueError(f"b should be ~{eb:.4f}, got {b:.4f}")
yp=m*xs+b
expected_loss=np.mean((ys-yp)**2)
if abs(final_loss-expected_loss)>0.1: raise ValueError(f"final_loss wrong")
res=f"SUCCESS: GD converged to m={m:.4f}, b={b:.4f}, MSE={final_loss:.4f}."
res
`,hint:'for _ in range(1000):\n    y_pred=m*xs+b\n    residuals=ys-y_pred\n    m-=lr*(-2*np.mean(xs*residuals))\n    b-=lr*(-2*np.mean(residuals))\nfinal_loss=np.mean((ys-(m*xs+b))**2)'},
    ]}}],
  },
  mentalModel:[
    'Gradient descent: step in the negative gradient direction, repeat until convergence.',
    'Learning rate too high → oscillates. Too low → slow. Just right → smooth convergence.',
    'Loss curve: should decrease monotonically. Oscillation = lower lr. Too slow = higher lr.',
    'For linear regression GD converges to the same answer as the normal equations.',
    'All deep learning is gradient descent on a very complex loss function.',
  ],
}
