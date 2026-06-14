export default {
  id:'c-03',slug:'data-cleaning',track:'C',order:3,
  title:'Data Cleaning',subtitle:'Real Data Is Always Wrong',
  tags:['missing-values','type-conversion','duplicates','outliers','pipeline'],
  prereqs:['c-01','a-10'],unlocks:['c-04'],
  hook:{question:'What do you do when data is broken before you even start?',realWorldContext:'A model trained on dirty data learns the dirt. Missing values, wrong types, and duplicates silently corrupt every downstream statistic and prediction. Cleaning is not optional — it is the difference between a result you can trust and one that will embarrass you.'},
  intuition:{
    prose:[
      '**Missing values** (NaN) propagate silently: NaN + 5 = NaN. Find them with `df.isnull().sum()`. Handle them by dropping rows, filling with a statistic, or forward-filling. The right choice depends on the domain and the amount missing.',
      '**Type conversion errors** are the most common data quality problem. A column of prices stored as strings with "$" prefixes will silently fail every arithmetic operation — the column exists, looks right, cannot be used for math.',
      '**Duplicates** inflate counts and distort averages. Always check with `df.duplicated().sum()` before any analysis. Remove with `df.drop_duplicates()`.',
    ],
    callouts:[{type:'important',title:'Missing Value Decision Framework',body:'< 5% missing:  drop the rows\n5-30% missing:  fill numeric with median, categorical with mode\n> 30% missing:  drop the column or add a "was_missing" indicator flag\n\nAlways ask: WHY is it missing? Missingness is often informative.'}],
    visualizations:[{id:'PythonNotebook',title:'Data Cleaning',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Detecting Missing Values',
       prose:'isnull() returns a boolean DataFrame. Sum per column gives you counts.',
       instructions:'Run. The percentage row tells you how serious each column\'s missingness is.',
       code:'import pandas as pd, numpy as np\ndf = pd.DataFrame({"age":[25,np.nan,30,22,np.nan,35],"salary":[50000,75000,np.nan,45000,90000,80000],"name":["A","B","C","D","E","F"]})\nprint("Null counts:")\nprint(df.isnull().sum())\nprint("\\nPercentage missing:")\nprint((df.isnull().sum()/len(df)*100).round(1))',output:'',status:'idle'},
      {id:2,cellTitle:'Stage 2 — Handling Missing Values',
       prose:'Three strategies: drop, fill with statistic, forward fill.',
       instructions:'Run. Each strategy has tradeoffs. Dropping loses data. Filling introduces assumptions.',
       code:'import pandas as pd, numpy as np\ndf = pd.DataFrame({"score":[85,np.nan,92,np.nan,78,88],"prev":[80,85,90,70,np.nan,85]})\nprint("Drop rows with any null:")\nprint(df.dropna())\nprint("\\nFill with column median:")\ndf_filled = df.fillna(df.median())\nprint(df_filled)\nprint("\\nForward fill (carry last value forward):")\nprint(df.ffill())',output:'',status:'idle'},
      {id:3,cellTitle:'Stage 3 — The Type Conversion Problem',
       prose:'Numbers stored as strings fail silently — they look fine but cannot be used for math.',
       instructions:'Run. The "$" prefix makes price an "object" column. Strip it and convert.',
       code:'import pandas as pd\ndf = pd.DataFrame({"product":["Apple","Banana","Cherry"],"price":["$1.20","$0.50","$2.99"]})\nprint("Before:", df["price"].dtype)\n# print(df["price"].mean())  # uncomment to see the error\ndf["price"] = df["price"].str.replace("$","",regex=False).astype(float)\nprint("After:", df["price"].dtype)\nprint("Mean:", df["price"].mean())',output:'',status:'idle'},
      {id:4,cellTitle:'Stage 4 — Duplicates',
       prose:'Duplicate rows silently inflate every statistic.',
       instructions:'Run. The original 7 rows include 3 duplicates. The mean shifts after removal.',
       code:'import pandas as pd\ndf = pd.DataFrame({"id":[1,2,2,3,4,4,4],"value":[10,20,20,30,40,40,40]})\nprint(f"Before: {len(df)} rows, {df.duplicated().sum()} duplicates")\nprint(f"Mean value: {df[\"value\"].mean():.1f}")\ndf_clean = df.drop_duplicates()\nprint(f"After: {len(df_clean)} rows")\nprint(f"Mean value: {df_clean[\"value\"].mean():.1f}")',output:'',status:'idle'},
      {id:5,cellTitle:'Stage 5 — String Cleaning',
       prose:'Text data often has inconsistent formatting. Standardize before grouping.',
       instructions:'Run. Without cleaning, "eng" and "Eng" and "ENG" are three separate groups.',
       code:'import pandas as pd\ndf = pd.DataFrame({"dept":["eng","Eng","ENG","mkt","MKT","Mkt"],"salary":[80,90,85,65,70,68]})\nprint("Unclean groups:", df.groupby("dept")["salary"].mean())\ndf["dept"] = df["dept"].str.upper().str.strip()\nprint("Clean groups:", df.groupby("dept")["salary"].mean())',output:'',status:'idle'},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Full Cleaning Pipeline',
       difficulty:'hard',
       prompt:'Clean the dataset by: (1) dropping the "id" column, (2) filling missing age with median, (3) dropping rows where salary is NaN, (4) stripping "$" from price and converting to float. Store result in df_clean.',
       instructions:'Apply each step in order. Chain where possible.',
       code:'import pandas as pd, numpy as np\ndf = pd.DataFrame({"id":[1,2,3,4,5],"age":[25,np.nan,30,22,35],"salary":[50000,75000,np.nan,45000,90000],"price":["$10.00","$25.00","$15.00",np.nan,"$20.00"]})\ndf_clean = df.copy()\n# Your steps here\n',output:'',status:'idle',
       testCode:`
if 'id' in df_clean.columns: raise ValueError("Should have dropped 'id' column")
if df_clean['age'].isnull().any(): raise ValueError("Missing age values should be filled with median")
if df_clean['salary'].isnull().any(): raise ValueError("Rows with missing salary should be dropped")
if str(df_clean['price'].dtype) not in ['float64','float32']: raise ValueError(f"price should be float, got {df_clean['price'].dtype}")
if len(df_clean)!=4: raise ValueError(f"Expected 4 rows (1 salary row dropped), got {len(df_clean)}")
res="SUCCESS: All 4 cleaning steps applied correctly."
res
`,hint:'df_clean=df.drop(columns=["id"])\ndf_clean["age"]=df_clean["age"].fillna(df_clean["age"].median())\ndf_clean=df_clean.dropna(subset=["salary"])\ndf_clean["price"]=df_clean["price"].str.replace("$","",regex=False).astype(float)'},
    ]}}],
  },
  mentalModel:[
    'df.isnull().sum() — find missing values per column. Percentage = /len(df)*100.',
    'dropna() removes rows. fillna(median) fills them. ffill() carries last value forward.',
    'Type errors: .str.replace().astype(float) — strip non-numeric chars before converting.',
    'drop_duplicates() — always check before computing statistics.',
    '.str.upper().str.strip() — standardize string categories before grouping.',
  ],
}
