export default {
  id:'d-06',slug:'model-evaluation-and-overfitting',track:'D',order:6,
  title:'Model Evaluation and Overfitting',subtitle:'Does Your Model Actually Generalise?',
  tags:['overfitting','train-test-split','cross-validation','bias-variance','sklearn'],
  prereqs:['d-05'],unlocks:[],
  hook:{question:'How do you know if your model is actually good — or just memorized the training data?',realWorldContext:'A model that memorizes training data is worthless. The test is always: does it generalize to data it has never seen? This distinction between training performance and generalization performance is the central question of all of machine learning.'},
  intuition:{
    prose:[
      'A model **overfits** when it learns the training data too well — including its noise. A degree-15 polynomial through 10 points passes through every point but predicts terribly on new data. Overfitting is always visible in the gap between training and test error.',
      '**Train/test split**: hold out 20-30% of data as a test set. Never touch it until final evaluation. Train on the remainder. The test error is your honest estimate of generalization.',
      '**k-fold cross-validation**: split data into k folds. Train on k-1 folds, evaluate on the remaining fold. Rotate. Average all k scores. More reliable than a single split because every point is tested exactly once.',
    ],
    callouts:[{type:'important',title:'The Golden Rule',body:'NEVER use the test set during model development.\nNot for tuning. Not for feature selection. Not for comparison.\nOnly for the final evaluation.\n\nIf you peek at the test set during development, your evaluation\nis optimistically biased — you are fitting to the test set too.'}],
    visualizations:[{id:'PythonNotebook',title:'Model Evaluation',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Overfitting Visualized',
       prose:'High-degree polynomials pass through every point but generalize poorly.',
       instructions:'Run. The degree-1 model underfits. Degree-15 overfits. Degree-3 is just right.',
       code:'from opencalc import Figure\nimport numpy as np\nnp.random.seed(42)\nxs_train=np.linspace(0,5,12)\nys_train=np.sin(xs_train)+np.random.normal(0,0.3,12)\nxs_test=np.linspace(0,5,100)\nfig=Figure(xmin=-0.5,xmax=5.5,ymin=-2,ymax=2,title="Overfitting: degree 1 vs 3 vs 15")\nfig.grid().axes()\nfig.scatter(xs_train.tolist(),ys_train.tolist(),color="blue",radius=4)\nfor deg,color,label in [(1,"green","degree 1"),(3,"amber","degree 3"),(15,"red","degree 15")]:\n    coeffs=np.polyfit(xs_train,ys_train,deg)\n    fig.plot(lambda x,c=coeffs: np.polyval(c,x),color=color,label=label)\nfig.show()',output:'',status:'idle'},
      {id:2,cellTitle:'Stage 2 — Train/Test Split',
       prose:'Hold out test data. Never use it until final evaluation.',
       instructions:'Run. Notice training R² is higher than test R² — the model fits training data better.',
       code:'import numpy as np\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.preprocessing import PolynomialFeatures\nfrom sklearn.pipeline import make_pipeline\nnp.random.seed(42)\nX=np.random.uniform(0,5,100).reshape(-1,1)\ny=np.sin(X.ravel())+np.random.normal(0,0.3,100)\nX_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.2,random_state=42)\nfor deg in [1,3,10]:\n    model=make_pipeline(PolynomialFeatures(deg),LinearRegression())\n    model.fit(X_train,y_train)\n    print(f"Degree {deg:>2}: train R²={model.score(X_train,y_train):.3f}, test R²={model.score(X_test,y_test):.3f}")',output:'',status:'idle'},
      {id:3,cellTitle:'Stage 3 — K-Fold Cross Validation',
       prose:'Every data point gets evaluated exactly once. More reliable than single split.',
       instructions:'Run. The mean and std of scores tell you performance and consistency.',
       code:'import numpy as np\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.preprocessing import PolynomialFeatures\nfrom sklearn.pipeline import make_pipeline\nnp.random.seed(42)\nX=np.random.uniform(0,5,100).reshape(-1,1)\ny=np.sin(X.ravel())+np.random.normal(0,0.3,100)\nfor deg in [1,3,10]:\n    model=make_pipeline(PolynomialFeatures(deg),LinearRegression())\n    scores=cross_val_score(model,X,y,cv=5,scoring="r2")\n    print(f"Degree {deg:>2}: CV R²={scores.mean():.3f} ± {scores.std():.3f}")',output:'',status:'idle'},
      {id:4,cellTitle:'Stage 4 — Bias-Variance Tradeoff',
       prose:'Underfitting = high bias. Overfitting = high variance. Best model balances both.',
       instructions:'Run. The validation error curve forms a U-shape — the sweet spot is the bottom.',
       code:'import numpy as np\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.preprocessing import PolynomialFeatures\nfrom sklearn.pipeline import make_pipeline\nnp.random.seed(42)\nX=np.random.uniform(0,5,200).reshape(-1,1)\ny=np.sin(X.ravel())+np.random.normal(0,0.3,200)\nX_tr,X_val,y_tr,y_val=train_test_split(X,y,test_size=0.3)\ndegrees=range(1,12)\ntrain_err=[]\nval_err=[]\nfor d in degrees:\n    m=make_pipeline(PolynomialFeatures(d),LinearRegression())\n    m.fit(X_tr,y_tr)\n    train_err.append(1-m.score(X_tr,y_tr))\n    val_err.append(1-m.score(X_val,y_val))\nbest=degrees[val_err.index(min(val_err))]\nprint(f"Best degree: {best}")\nfor d,tr,va in zip(degrees,train_err,val_err):\n    print(f"  degree {d:>2}: train_err={tr:.3f}, val_err={va:.3f}")',output:'',status:'idle'},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Full Evaluation Pipeline',
       difficulty:'hard',
       prompt:'Train three models of increasing complexity on housing data. Use 5-fold cross-validation to find the best. Store best_degree (int) and best_cv_score (float).',
       instructions:'1. Build pipelines for degree 1, 2, 3.\n2. cross_val_score for each.\n3. best_degree = degree with highest mean CV score.',
       code:'import numpy as np\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.preprocessing import PolynomialFeatures\nfrom sklearn.pipeline import make_pipeline\nnp.random.seed(42)\nX=np.random.normal(1500,400,150).reshape(-1,1)\ny=X.ravel()*150+50000+np.random.normal(0,30000,150)\nbest_degree = \nbest_cv_score = \nprint(f"Best degree: {best_degree}, CV R²: {best_cv_score:.4f}")\n',output:'',status:'idle',
       testCode:`
import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
np.random.seed(42)
X=np.random.normal(1500,400,150).reshape(-1,1)
y=X.ravel()*150+50000+np.random.normal(0,30000,150)
scores={}
for d in [1,2,3]:
    m=make_pipeline(PolynomialFeatures(d),LinearRegression())
    scores[d]=cross_val_score(m,X,y,cv=5,scoring="r2").mean()
exp_best=max(scores,key=scores.get)
if best_degree not in [1,2,3]: raise ValueError(f"best_degree should be 1, 2, or 3, got {best_degree}")
if abs(best_cv_score-scores[best_degree])>0.01: raise ValueError(f"best_cv_score wrong for degree {best_degree}")
res=f"SUCCESS: Best degree={best_degree}, CV R²={best_cv_score:.4f}. Full evaluation pipeline complete."
res
`,hint:'results={}\nfor d in [1,2,3]:\n    m=make_pipeline(PolynomialFeatures(d),LinearRegression())\n    results[d]=cross_val_score(m,X,y,cv=5,scoring="r2").mean()\nbest_degree=max(results,key=results.get)\nbest_cv_score=results[best_degree]'},
    ]}}],
  },
  mentalModel:[
    'Overfitting: model learns training noise. Visible in train >> test performance.',
    'Train/test split: never touch test set until final evaluation. Golden rule.',
    'k-fold CV: every point is tested exactly once. More reliable than single split.',
    'Bias-variance tradeoff: too simple = underfits. Too complex = overfits.',
    'Choose model complexity by validation error, not training error.',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A polynomial model has train R² = 0.99 and test R² = 0.42. What does this indicate?',
      options: [
        'The model is excellent — R² = 0.99 means it has learned the data very well',
        'The model is overfitting — it has memorized the training data including its noise, but fails to generalize. The large gap between train and test performance is the signature of overfitting; a simpler model with lower train R² but higher test R² would be better',
        'The test set must have different characteristics than the training set — the split should be redone',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why is the "golden rule" of machine learning to never use the test set during model development?',
      options: [
        'Test sets are small and running many evaluations on them wastes memory',
        'Every time you evaluate on the test set and make a model decision based on it, you are implicitly fitting the model to the test set — even if you never train on it. This makes your final test evaluation optimistically biased, destroying its value as an honest estimate of how the model performs on truly unseen data',
        'Modern sklearn pipelines automatically prevent test data from leaking into training',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '5-fold cross-validation splits data into 5 folds, trains on 4, evaluates on 1, and rotates. What key advantage does this have over a single train/test split?',
      options: [
        'Cross-validation is faster because each fold uses less data',
        'Every data point is tested exactly once across the 5 rotations — you get 5 performance estimates instead of 1, giving a mean and standard deviation to assess consistency; a single split can be unlucky (easy test set or hard test set) giving a misleading one-off number',
        'Cross-validation prevents overfitting by training on smaller datasets',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The bias-variance tradeoff: a degree-1 polynomial (straight line) fits a sinusoidal dataset. A degree-15 polynomial fits the same data. What is wrong with each?',
      options: [
        'Degree-1 has too many parameters; degree-15 has too few',
        'Degree-1 underfits (high bias) — its rigid form cannot capture the true curve and performs poorly on both training and test data. Degree-15 overfits (high variance) — it passes through every training point including noise and generalizes poorly; the best model captures the signal without memorizing the noise',
        'Both are equally bad — only degree-3 polynomials are valid for sinusoidal data',
      ],
      correct: 1,
    },
  ],
}
