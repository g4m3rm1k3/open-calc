export default {
  id:'c-04',slug:'data-transformation',track:'C',order:4,
  title:'Data Transformation and Feature Engineering',subtitle:'Preparing Data for Computation',
  tags:['log-transform','normalization','z-score','one-hot-encoding','feature-engineering'],
  prereqs:['c-03','b-04'],unlocks:['c-05'],
  hook:{question:'Why does transforming data before modeling matter?',realWorldContext:'Raw data is rarely in the right form for a model. Income data spans 5 orders of magnitude — a linear model will be dominated by the highest values. Log-transforming compresses the range. These transformations are not cosmetic — they change what the model learns.'},
  intuition:{
    prose:[
      '**Log transformation** fixes right-skewed distributions. Income, population counts, prices — all right-skewed. `np.log(data)` compresses the range and makes extreme values less dominant.',
      '**Normalization** brings features to the same scale so no one feature dominates due to its units. Two methods: min-max (scales to [0,1]) and z-score (shifts to mean=0, std=1). Use z-score when features have different units (height in cm, weight in kg).',
      '**One-hot encoding** converts categorical variables into binary columns. Required before any numeric ML algorithm. `pd.get_dummies(df, columns=["category"])` does this automatically.',
    ],
    callouts:[{type:'important',title:'Which Transform for Which Problem',body:'Log: right-skewed data (income, prices, counts)\nMin-max: need values in [0,1] — neural nets, image pixels\nZ-score: different units across features — most ML algorithms\nOne-hot: categorical features — any ML model that needs numbers\n\nAlways: check the distribution BEFORE choosing the transform.'}],
    visualizations:[{id:'PythonNotebook',title:'Data Transformation',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Log Transform on Skewed Data',
       prose:'Log compresses the right tail, making the distribution more symmetric.',
       instructions:'Run. Notice the range compression: 30k-1M becomes 10-14 in log space.',
       code:'import numpy as np\nfrom opencalc import Figure\nincome = np.array([30000,35000,40000,45000,50000,75000,100000,250000,1000000])\nlog_income = np.log(income)\nprint(f"Income: min={income.min():,}, max={income.max():,}")\nprint(f"Log income: min={log_income.min():.2f}, max={log_income.max():.2f}")\nprint(f"\\nIncome: mean={np.mean(income):,.0f}, median={np.median(income):,.0f}")\nprint(f"Log income: mean={np.mean(log_income):.2f}, median={np.median(log_income):.2f}")',output:'',status:'idle'},
      {id:2,cellTitle:'Stage 2 — Min-Max Normalization',
       prose:'Scale all values to [0,1]. The minimum maps to 0, maximum to 1.',
       instructions:'Run. Verify: min of result is 0, max is 1.',
       code:'import numpy as np\ndata = np.array([10.0, 20.0, 30.0, 40.0, 50.0])\nnormalized = (data - data.min()) / (data.max() - data.min())\nprint("Original:", data)\nprint("Normalized:", normalized)\nprint(f"New range: [{normalized.min()}, {normalized.max()}]")',output:'',status:'idle'},
      {id:3,cellTitle:'Stage 3 — Z-Score Standardization',
       prose:'Shift to mean=0, scale to std=1. Values are now in units of "standard deviations from mean."',
       instructions:'Run. Verify mean≈0 and std≈1 after transform.',
       code:'import numpy as np\ndata = np.array([100.0, 200, 150, 250, 175, 225, 125, 175])\nz = (data - np.mean(data)) / np.std(data)\nprint("Z-scores:", z.round(3))\nprint(f"Mean: {np.mean(z):.10f} (essentially 0)")\nprint(f"Std: {np.std(z):.6f} (essentially 1)")',output:'',status:'idle'},
      {id:4,cellTitle:'Stage 4 — One-Hot Encoding',
       prose:'Convert categorical columns into binary indicator columns.',
       instructions:'Run. The "color" column with 3 categories becomes 3 binary columns.',
       code:'import pandas as pd\ndf = pd.DataFrame({"color":["red","blue","green","red","blue"],"value":[10,20,15,25,30]})\nprint("Before:")\nprint(df)\nprint("\\nAfter one-hot encoding:")\nencoded = pd.get_dummies(df, columns=["color"])\nprint(encoded)',output:'',status:'idle'},
      {id:5,cellTitle:'Stage 5 — Feature Engineering',
       prose:'Creating new features from existing ones can dramatically improve model performance.',
       instructions:'Run. area (derived feature) may be more predictive than length and width separately.',
       code:'import pandas as pd\ndf = pd.DataFrame({"length":[10.0,15,8,20,12],"width":[5.0,8,4,10,6],"price":[200,450,120,800,300]})\ndf["area"] = df["length"] * df["width"]          # derived feature\ndf["aspect_ratio"] = df["length"] / df["width"]  # shape feature\ndf["log_price"] = df["price"].apply(__import__("numpy").log)  # log of target\nprint(df.round(2))',output:'',status:'idle'},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Transform Pipeline',
       difficulty:'hard',
       prompt:'Transform the housing dataset: (1) log-transform price, store as log_price, (2) z-score standardize sqft, store as sqft_z, (3) one-hot encode neighborhood. Store everything in df_out.',
       instructions:'1. df["log_price"] = np.log(df["price"]).\n2. df["sqft_z"] = (x - mean)/std.\n3. pd.get_dummies() on neighborhood.\n4. Store full result in df_out.',
       code:'import pandas as pd, numpy as np\ndf = pd.DataFrame({"price":[200000,350000,500000,150000,800000],"sqft":[1200,1800,2200,900,3000],"neighborhood":["North","South","North","East","South"]})\n# Your transformations here\ndf_out = df.copy()\n',output:'',status:'idle',
       testCode:`
if 'log_price' not in df_out.columns: raise ValueError("Missing log_price column")
import numpy as np
expected_lp = np.log([200000,350000,500000,150000,800000])
if not all(abs(df_out['log_price'].values - expected_lp) < 0.001): raise ValueError("log_price values wrong")
if 'sqft_z' not in df_out.columns: raise ValueError("Missing sqft_z column")
if abs(df_out['sqft_z'].mean()) > 0.01: raise ValueError("sqft_z mean should be ~0")
if not any('neighborhood_' in c for c in df_out.columns): raise ValueError("neighborhood should be one-hot encoded")
res="SUCCESS: All three transformations applied correctly."
res
`,hint:'df_out["log_price"]=np.log(df_out["price"])\ndf_out["sqft_z"]=(df_out["sqft"]-df_out["sqft"].mean())/df_out["sqft"].std()\ndf_out=pd.get_dummies(df_out,columns=["neighborhood"])'},
    ]}}],
  },
  mentalModel:[
    'Log transform: np.log(data) — fixes right skew, compresses extreme values.',
    'Min-max: (x-min)/(max-min) → [0,1]. Use for bounded inputs.',
    'Z-score: (x-mean)/std → mean=0, std=1. Use when units differ across features.',
    'One-hot: pd.get_dummies(df, columns=["cat"]) — required before numeric ML.',
    'Feature engineering: create derived columns (area, ratios, logs of targets).',
  ],
}
