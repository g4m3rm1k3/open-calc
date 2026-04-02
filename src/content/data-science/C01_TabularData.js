export default {
  id:'c-01', slug:'tabular-data-and-pandas', track:'C', order:1,
  title:'Tabular Data and Pandas', subtitle:'The DataFrame Model',
  tags:['pandas','dataframe','series','filtering','boolean-indexing'],
  prereqs:['a-14','b-02'], unlocks:['c-02','c-03'],
  hook:{
    question:'What is a DataFrame and why does it exist?',
    realWorldContext:'Pandas is the primary tool for data science in Python. A DataFrame is not a spreadsheet — it is a dict of named NumPy arrays. Understanding that model determines whether you can use pandas fluently or only copy-paste examples.',
  },
  intuition:{
    prose:[
      'A **DataFrame** is a dict of named arrays. Each column is a Series — a NumPy array with a name and an index. This gives you named access like a dict, positional access like an array, and vectorized math on entire columns.',
      'A **Series** is a single named column. `df["price"] * 1.1` multiplies every element by 1.1, no loop. Operations are vectorized.',
      'The first three lines with any new dataset: `df.head()`, `df.info()`, `df.describe()`. These tell you shape, types, nulls, and distribution. Never skip them.',
    ],
    callouts:[{type:'important',title:'The Three Lines You Always Run',body:`df.head()      # first 5 rows — see the data
df.info()      # column names, types, null counts
df.describe()  # min, max, mean, std for each column

Never skip these. They catch 80% of data quality issues.`}],
    visualizations:[{id:'PythonNotebook',title:'Tabular Data and Pandas',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Creating a DataFrame',
       prose:'Build a DataFrame from a dict of lists. Each key becomes a column.',
       instructions:'Run the cell. Notice how the dict structure maps to columns.',
       code:`import pandas as pd
df = pd.DataFrame({
    "name": ["Alice","Bob","Carol","Dave"],
    "score": [92, 78, 85, 63],
    "grade": ["A","C","B","D"]
})
df`},
      {id:2,cellTitle:'Stage 2 — Accessing Columns',
       prose:'A column access returns a Series. Operations on it are vectorized.',
       instructions:'Run. df["score"] is a Series. Operations apply to every element.',
       code:`import pandas as pd
df = pd.DataFrame({"name":["Alice","Bob","Carol"],"score":[92,78,85]})
print(df["score"])          # Series
print(df["score"].mean())   # 85.0
print(df["score"] * 1.1)   # every element * 1.1`},
      {id:3,cellTitle:'Stage 3 — The First Three Lines',
       prose:'Run these on every new dataset before doing anything else.',
       instructions:'Run. Read the info() output: types, non-null counts. Read describe(): distribution.',
       code:`import pandas as pd, numpy as np
df = pd.DataFrame({"age":[25,30,None,22,35],"salary":[50000,75000,60000,45000,90000],"dept":["Eng","Mkt","Eng","Sales","Eng"]})
print(df.head())
print()
print(df.info())
print()
print(df.describe())`},
      {id:4,cellTitle:'Stage 4 — Boolean Filtering',
       prose:'A boolean condition on a column produces a mask. Use the mask to filter rows.',
       instructions:'Run. The condition df["score"]>80 creates a True/False Series. It selects matching rows.',
       code:`import pandas as pd
df = pd.DataFrame({"name":["Alice","Bob","Carol","Dave"],"score":[92,78,85,63],"dept":["Eng","Mkt","Eng","Mkt"]})
print(df[df["score"] > 80])
print()
print(df[(df["score"] > 80) & (df["dept"] == "Eng")])`},
      {id:5,cellTitle:'Stage 5 — Adding Computed Columns',
       prose:'New columns are vectorized expressions over existing ones. No loop needed.',
       instructions:'Run. revenue = price * qty is computed element-wise across the whole column.',
       code:`import pandas as pd
df = pd.DataFrame({"price":[10.0,25.0,15.0],"qty":[100,50,200]})
df["revenue"] = df["price"] * df["qty"]
df["discounted"] = df["price"] * 0.9
df`},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Filter and Compute',
       difficulty:'medium',
       prompt:'Filter the DataFrame to only Engineering employees, then compute their average salary. Store the filtered DataFrame in filtered_df and the average in avg_salary.',
       instructions:`1. Filter where dept=="Engineering". 2. Compute mean of salary. 3. Store both results.`,
       code:`import pandas as pd
df = pd.DataFrame({"name":["Alice","Bob","Carol","Dave","Eve"],"salary":[80000,65000,90000,70000,85000],"dept":["Engineering","Marketing","Engineering","Marketing","Engineering"]})
filtered_df = 
avg_salary = 
`,
       testCode:`
if len(filtered_df)!=3: raise ValueError(f"filtered_df should have 3 rows (Engineering), got {len(filtered_df)}")
expected=(80000+90000+85000)/3
if abs(avg_salary-expected)>1: raise ValueError(f"avg_salary should be {expected:.0f}, got {avg_salary}")
res=f"SUCCESS: 3 Engineering employees, average salary {avg_salary:,.0f}."
res
`,hint:`filtered_df = df[df["dept"]=="Engineering"]
avg_salary = filtered_df["salary"].mean()`},
      {id:12,challengeType:'write',challengeNumber:2,challengeTitle:'Challenge 2 — Revenue Analysis',
       difficulty:'medium',
       prompt:'Add a revenue column (price * quantity). Then filter to only rows where revenue > 500 and store in high_revenue. Add a margin column (profit / revenue * 100) and store the average margin in avg_margin.',
       instructions:`1. df["revenue"] = price * quantity. 2. Filter where revenue > 500. 3. df["margin"] = profit/revenue*100. Compute mean.`,
       code:`import pandas as pd
df = pd.DataFrame({"product":["A","B","C","D","E"],"price":[5.0,12.0,8.0,25.0,3.0],"quantity":[100,60,200,30,400],"profit":[150,180,400,225,240]})
`,
       testCode:`
if 'revenue' not in df.columns: raise ValueError("Missing revenue column")
if 'high_revenue' not in dir(): raise ValueError("Missing high_revenue DataFrame")
if len(high_revenue)!=3: raise ValueError(f"high_revenue should have 3 rows (revenue>500), got {len(high_revenue)}")
if abs(avg_margin - df.assign(revenue=df.price*df.quantity,margin=df.profit/(df.price*df.quantity)*100)["margin"].mean()) > 0.1:
    raise ValueError("avg_margin incorrect")
res=f"SUCCESS: Revenue computed, filtered, margin analysed. avg_margin={avg_margin:.1f}%"
res
`,hint:`df["revenue"]=df["price"]*df["quantity"]
high_revenue=df[df["revenue"]>500]
df["margin"]=df["profit"]/df["revenue"]*100
avg_margin=df["margin"].mean()`},
    ]}}],
  },
  mentalModel:[
    'DataFrame = dict of named NumPy arrays. Each column is a Series.',
    'Always run: df.head(), df.info(), df.describe() on any new dataset.',
    'Boolean filtering: condition → mask Series → df[mask] selects matching rows.',
    'New columns: df["col"] = expression over existing columns. Fully vectorized.',
    'df["col"].mean(), .sum(), .max() etc. are aggregations over the whole column.',
  ],
}
