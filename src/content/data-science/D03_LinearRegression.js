export default {
  id:'d-03',slug:'linear-regression-from-scratch',track:'D',order:3,
  title:'Linear Regression from Scratch',subtitle:'Why That Line?',
  tags:['regression','least-squares','normal-equations','R-squared','residuals'],
  prereqs:['b-03','b-07','d-02'],unlocks:['d-04','d-05'],
  hook:{question:'How do you fit a line to data — and why is THAT the best line?',realWorldContext:'Linear regression is the foundation of all supervised ML. Neural networks are stacked linear regressions with nonlinearities. Understanding the math — why least squares, what R² means, what residuals tell you — makes every more complex model comprehensible.'},
  intuition:{
    prose:[
      'Linear regression finds the line y=mx+b that minimizes the **sum of squared residuals** (SSR). Squared residuals penalize large errors more than small ones. The minimum is a closed-form solution: the **normal equations** β=(XᵀX)⁻¹Xᵀy. This is where Track B\'s linear algebra pays off.',
      '**R²** (coefficient of determination) is the fraction of variance in y explained by the model. R²=1: perfect fit. R²=0: model is no better than predicting the mean. R² can be negative if the model is worse than the mean.',
      '**Residual analysis** reveals whether the model is correct. Plot residuals vs predicted values. If you see a pattern (curve, funnel), the linear model is wrong for that data. Residuals should be random scatter around zero.',
    ],
    callouts:[{type:'important',title:'R² Interpretation',body:'R² = 1 - SS_residual/SS_total\n    = fraction of variance explained\n\nR² = 0.85 means the model explains 85% of the variation in y.\nThe remaining 15% is unexplained — due to noise or missing features.\n\nHigh R² on training data does not mean good predictions.\nAlways evaluate on held-out test data.'}],
    visualizations:[{id:'PythonNotebook',title:'Linear Regression',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — What We Are Minimizing',
       prose:'The residual for each point is actual - predicted. We minimize the sum of squared residuals.',
       instructions:'Run. The red dashed lines are residuals. We want to find the line that makes these as small as possible.',
       code:'from opencalc import Figure\nimport numpy as np\nxs = np.array([1.0,2,3,4,5])\nys = np.array([2.1,3.9,6.2,7.8,10.1])\nm,b = 2, 0  # try adjusting these\nssr = sum((y-(m*x+b))**2 for x,y in zip(xs,ys))\nfig = Figure(xmin=0,xmax=6,ymin=0,ymax=12)\nfig.grid().axes()\nfig.scatter(xs.tolist(),ys.tolist(),color="blue")\nfig.plot(lambda x: m*x+b, color="amber", label=f"y={m}x+{b}")\nfor xi,yi in zip(xs,ys):\n    fig.line([xi,yi],[xi,m*xi+b],color="red",dashed=True)\nfig.text([3,1],f"SSR={ssr:.2f}",color="red")\nfig.show()',output:'',status:'idle'},
      {id:2,cellTitle:'Stage 2 — Normal Equations from Scratch',
       prose:'β=(XᵀX)⁻¹Xᵀy gives the exact least-squares solution.',
       instructions:'Run. Verify manual result matches np.polyfit.',
       code:'import numpy as np\nxs = np.array([1.0,2,3,4,5,6,7,8])\nys = np.array([2.1,3.8,5.9,8.2,9.8,12.1,14.3,16.0])\n# Design matrix: column of ones + x values\nX = np.column_stack([np.ones(len(xs)), xs])\n# Normal equations: β = (XᵀX)⁻¹ Xᵀy\nbeta = np.linalg.inv(X.T @ X) @ X.T @ ys\nb, m = beta\nprint(f"Manual: y = {m:.4f}x + {b:.4f}")\nprint(f"polyfit: {np.polyfit(xs,ys,1)}")',output:'',status:'idle'},
      {id:3,cellTitle:'Stage 3 — R² Explained',
       prose:'R² = 1 - SS_residual/SS_total. Fraction of variance explained.',
       instructions:'Run. A perfect fit has R²=1. The mean-only model has R²=0.',
       code:'import numpy as np\nxs = np.array([1.0,2,3,4,5,6,7,8])\nys = np.array([2.1,3.8,5.9,8.2,9.8,12.1,14.3,16.0])\nm,b = np.polyfit(xs,ys,1)\ny_pred = m*xs + b\nss_residual = np.sum((ys - y_pred)**2)\nss_total = np.sum((ys - np.mean(ys))**2)\nr2 = 1 - ss_residual/ss_total\nprint(f"SS_residual = {ss_residual:.4f}")\nprint(f"SS_total    = {ss_total:.4f}")\nprint(f"R²          = {r2:.4f}")  # should be close to 1',output:'',status:'idle'},
      {id:4,cellTitle:'Stage 4 — Residual Plot',
       prose:'Plot residuals vs predicted. Random scatter = good. Patterns = wrong model.',
       instructions:'Run. A curved residual pattern suggests we need a nonlinear model.',
       code:'from opencalc import Figure\nimport numpy as np\nnp.random.seed(42)\nxs = np.linspace(0,5,30)\nys = xs**2 + np.random.normal(0,1,30)  # actually quadratic\nm,b = np.polyfit(xs,ys,1)\nresiduals = ys - (m*xs+b)\nfig = Figure(xmin=0,xmax=25,ymin=-8,ymax=8,title="Residual plot — curve = wrong model")\nfig.grid().axes()\nfig.scatter((m*xs+b).tolist(),residuals.tolist(),color="blue",radius=3)\nfig.hline(0,color="amber")\nfig.show()',output:'',status:'idle'},
      {id:5,cellTitle:'Stage 5 — Sklearn Linear Regression',
       prose:'sklearn wraps the normal equations in a clean API.',
       instructions:'Run. This is the API you will use in practice.',
       code:'import numpy as np\nfrom sklearn.linear_model import LinearRegression\nxs = np.array([1.0,2,3,4,5,6,7,8]).reshape(-1,1)\nys = np.array([2.1,3.8,5.9,8.2,9.8,12.1,14.3,16.0])\nmodel = LinearRegression()\nmodel.fit(xs, ys)\nprint(f"Coefficient: {model.coef_[0]:.4f}")\nprint(f"Intercept:   {model.intercept_:.4f}")\nprint(f"R²:          {model.score(xs, ys):.4f}")',output:'',status:'idle'},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Manual Normal Equations',
       difficulty:'hard',
       prompt:'Implement least squares WITHOUT np.polyfit or sklearn. Use the normal equations β=(XᵀX)⁻¹Xᵀy. Store the slope in m and intercept in b. Compute R² and store in r2.',
       instructions:'1. Build design matrix X (ones column + x values).\n2. beta = inv(XᵀX) @ Xᵀy.\n3. b=beta[0], m=beta[1].\n4. Compute R² from residuals.',
       code:'import numpy as np\nxs = np.array([1.0,2,3,4,5])\nys = np.array([2.0,4.1,5.9,8.2,10.0])\n# Your implementation here\nm = \nb = \nr2 = \nprint(f"y = {m:.4f}x + {b:.4f}, R² = {r2:.4f}")',output:'',status:'idle',
       testCode:`
import numpy as np
xs=np.array([1.0,2,3,4,5]);ys=np.array([2.0,4.1,5.9,8.2,10.0])
em,eb=np.polyfit(xs,ys,1)
ypred=m*xs+b
er2=1-np.sum((ys-ypred)**2)/np.sum((ys-ys.mean())**2)
if abs(m-em)>0.01: raise ValueError(f"m should be {em:.4f}, got {m:.4f}")
if abs(b-eb)>0.01: raise ValueError(f"b should be {eb:.4f}, got {b:.4f}")
if abs(r2-er2)>0.01: raise ValueError(f"r2 should be {er2:.4f}, got {r2:.4f}")
res=f"SUCCESS: y={m:.4f}x+{b:.4f}, R²={r2:.4f}. Normal equations work."
res
`,hint:'X=np.column_stack([np.ones(len(xs)),xs])\nbeta=np.linalg.inv(X.T@X)@X.T@ys\nb,m=beta\nypred=m*xs+b\nr2=1-np.sum((ys-ypred)**2)/np.sum((ys-ys.mean())**2)'},
    ]}}],
  },
  mentalModel:[
    'Linear regression minimizes sum of squared residuals (not absolute errors).',
    'Normal equations: β=(XᵀX)⁻¹Xᵀy — the closed-form solution.',
    'R² = 1 - SS_residual/SS_total = fraction of variance explained.',
    'Residual plot: random scatter = good model. Any pattern = wrong model.',
    'sklearn.LinearRegression() wraps the normal equations. model.score() = R².',
  ],
}
