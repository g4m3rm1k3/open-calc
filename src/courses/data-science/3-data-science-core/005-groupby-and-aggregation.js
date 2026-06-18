export default {
  id:'c-05',slug:'groupby-and-aggregation',track:'C',order:5,
  title:'GroupBy and Aggregation',subtitle:'Split-Apply-Combine',
  tags:['groupby','aggregation','pivot','transform','split-apply-combine'],
  prereqs:['c-04','a-11'],unlocks:['c-06'],
  hook:{question:'How do you compute statistics for subgroups within a dataset?',realWorldContext:'Almost every business question is a GroupBy: average revenue by product, highest-rated items by category, monthly growth by region. GroupBy is the most-used operation in data analysis after filtering.'},
  intuition:{
    prose:[
      '**GroupBy** implements split-apply-combine: (1) Split data into groups by column value. (2) Apply a function (mean, sum, count) to each group independently. (3) Combine results back into a table.',
      '**Multiple aggregations**: `.agg({"sales":"sum","price":"mean"})` applies different functions to different columns in one pass. More efficient than multiple separate GroupBy operations.',
      '**Transform** vs **aggregate**: aggregate reduces each group to one row. Transform produces one value per original row — the group statistic repeated for each member. Use transform to add group statistics as new columns for comparison.',
    ],
    callouts:[{type:'important',title:'The Three GroupBy Patterns',body:'Aggregate: df.groupby("col")["val"].mean()\n→ one row per group\n\nTransform: df.groupby("col")["val"].transform("mean")\n→ same shape as df, group stat for each row\n\nFilter: df.groupby("col").filter(lambda g: g["val"].mean()>50)\n→ rows of groups that pass the condition'}],
    visualizations:[{id:'PythonNotebook',title:'GroupBy and Aggregation',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Basic GroupBy',
       prose:'Group by one column, apply one aggregation.',
       instructions:'Run. One row per unique department with the aggregated salary.',
       code:'import pandas as pd\ndf = pd.DataFrame({"dept":["Eng","Mkt","Eng","Sales","Mkt","Eng"],"salary":[80000,65000,90000,55000,70000,85000]})\nprint(df.groupby("dept")["salary"].mean())\nprint()\nprint(df.groupby("dept")["salary"].agg(["mean","min","max","count"]))',output:'',status:'idle'},
      {id:2,cellTitle:'Stage 2 — Multiple Aggregations',
       prose:'Apply different functions to different columns simultaneously.',
       instructions:'Run. .agg() with a dict applies column-specific functions.',
       code:'import pandas as pd\ndf = pd.DataFrame({"dept":["Eng","Mkt","Eng","Sales","Mkt","Eng"],"salary":[80000,65000,90000,55000,70000,85000],"age":[30,25,35,28,32,29]})\nresult = df.groupby("dept").agg({"salary":["mean","max"],"age":"mean"})\nprint(result)',output:'',status:'idle'},
      {id:3,cellTitle:'Stage 3 — Transform: Add Group Stats to Rows',
       prose:'Transform returns a value for each original row, not one per group.',
       instructions:'Run. Each employee now has their department average salary for comparison.',
       code:'import pandas as pd\ndf = pd.DataFrame({"name":["A","B","C","D","E","F"],"dept":["Eng","Mkt","Eng","Sales","Mkt","Eng"],"salary":[80000,65000,90000,55000,70000,85000]})\ndf["dept_avg"] = df.groupby("dept")["salary"].transform("mean")\ndf["above_avg"] = df["salary"] > df["dept_avg"]\nprint(df)',output:'',status:'idle'},
      {id:4,cellTitle:'Stage 4 — Pivot Table',
       prose:'A pivot table is a two-dimensional GroupBy: rows=one category, columns=another.',
       instructions:'Run. aggfunc can be mean, sum, count, or any function.',
       code:'import pandas as pd\ndf = pd.DataFrame({"region":["N","N","S","S","E","E"],"product":["A","B","A","B","A","B"],"sales":[100,150,120,90,110,160]})\npivot = df.pivot_table(values="sales",index="region",columns="product",aggfunc="sum")\nprint(pivot)',output:'',status:'idle'},
      {id:5,cellTitle:'Stage 5 — Time-Based GroupBy',
       prose:'Group by a time period using resample() or groupby with a time key.',
       instructions:'Run. Monthly totals from daily data.',
       code:'import pandas as pd\nimport numpy as np\nnp.random.seed(42)\ndates = pd.date_range("2023-01-01","2023-03-31",freq="D")\ndf = pd.DataFrame({"date":dates,"sales":np.random.randint(100,500,len(dates))})\ndf = df.set_index("date")\nmonthly = df.resample("M").sum()\nprint(monthly)',output:'',status:'idle'},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — YoY Growth by Region',
       difficulty:'hard',
       prompt:'Compute year-over-year growth (%) for each region. Store in growth_df with columns "region" and "growth_pct".',
       instructions:'1. GroupBy region and year, sum sales.\n2. Unstack to get years as columns.\n3. growth = (2023-2022)/2022 * 100.',
       code:'import pandas as pd\ndf = pd.DataFrame({"region":["N","N","S","S","E","E","W","W"],"year":[2022,2023,2022,2023,2022,2023,2022,2023],"sales":[1000,1200,800,900,1100,1000,600,780]})\ngrowth_df = \n',output:'',status:'idle',
       testCode:`
if not hasattr(growth_df,'columns'): raise ValueError("growth_df should be a DataFrame")
if 'growth_pct' not in growth_df.columns: raise ValueError("Need growth_pct column")
if 'region' not in growth_df.columns: raise ValueError("Need region column")
n_row=growth_df[growth_df['region']=='N']
if len(n_row)==0: raise ValueError("Missing North region")
n_growth=n_row['growth_pct'].values[0]
if abs(n_growth-20)>0.1: raise ValueError(f"North growth should be 20%, got {n_growth:.1f}%")
res="SUCCESS: YoY growth computed. North +20%, South +12.5%, East -9.1%, West +30%."
res
`,hint:'totals=df.groupby(["region","year"])["sales"].sum().unstack()\ntotals["growth_pct"]=(totals[2023]-totals[2022])/totals[2022]*100\ngrowth_df=totals.reset_index()[["region","growth_pct"]]'},
    ]}}],
  },
  mentalModel:[
    'GroupBy: split by column → apply function per group → combine results.',
    '.agg({"col":"func"}) — apply different functions to different columns.',
    '.transform("mean") — returns group statistic for every original row.',
    '.pivot_table() — two-dimensional GroupBy: rows and columns both group.',
    '.resample("M") — time-based groupby by period (month, week, year).',
  ],
}
