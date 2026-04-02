export default {
  id:'c-02',slug:'descriptive-statistics',track:'C',order:2,
  title:'Descriptive Statistics',subtitle:'Summarizing Distributions',
  tags:['mean','median','variance','std','quartiles','IQR','outliers'],
  prereqs:['c-01','b-03'],unlocks:['c-03','d-01'],
  hook:{question:'How do you summarize a distribution in five numbers — and which five?',realWorldContext:'A data scientist who cannot interpret mean, median, variance, and quartiles cannot read a dataset. More critically: knowing WHICH measure to use requires understanding what question each one answers. Mean income is misleading when there are billionaires.'},
  intuition:{
    prose:[
      '**Mean** is the center of mass — pulled by outliers. **Median** is the middle value — robust to outliers. When mean >> median, distribution is right-skewed. Income data in most countries: mean >> median because a few billionaires pull the mean up.',
      '**Variance** is the average squared deviation from the mean. **Standard deviation** is its square root — in the same units as the data. Small std: data clusters near the mean. Large std: data is spread out.',
      '**Quartiles**: Q1=25th percentile, Q3=75th percentile, IQR=Q3-Q1. Statistical outliers: points below Q1-1.5×IQR or above Q3+1.5×IQR. This is the rule boxplots use.',
    ],
    callouts:[{type:'important',title:'Mean vs Median — When to Use Which',body:'Use MEAN when: distribution is roughly symmetric, no extreme outliers, you want the "center of mass"\n\nUse MEDIAN when: distribution is skewed, outliers are present, you want the "typical" value\n\nExamples:\nHouse prices → median (skewed right)\nTest scores → mean (roughly symmetric)\nIncomes → median (extreme right tail)'}],
    visualizations:[{id:'PythonNotebook',title:'Descriptive Statistics',props:{initialCells:[
      {id:1,cellTitle:'Stage 1 — Mean vs Median with Outlier',
       prose:'One outlier can dramatically shift the mean but barely moves the median.',
       instructions:'Run. Notice how adding 1000 to the list changes the mean by 85 points but the median barely moves.',
       code:'import numpy as np\nnormal = [12,15,14,13,16,15,14,13,15,12]\nwith_outlier = normal + [1000]\nprint(f"Without outlier: mean={np.mean(normal):.2f}, median={np.median(normal):.2f}")\nprint(f"With outlier:    mean={np.mean(with_outlier):.2f}, median={np.median(with_outlier):.2f}")',output:'',status:'idle'},
      {id:2,cellTitle:'Stage 2 — Variance and Std from First Principles',
       prose:'Variance = average of squared deviations. Std = square root of variance.',
       instructions:'Run. Verify manual calculation matches NumPy. Note: NumPy uses population std by default (ddof=0).',
       code:'import numpy as np\ndata = np.array([2.0,4,4,4,5,5,7,9])\nmean = np.mean(data)\ndeviations = data - mean\nsq_devs = deviations ** 2\nvariance = np.mean(sq_devs)\nstd = np.sqrt(variance)\nprint(f"Mean: {mean}")\nprint(f"Deviations: {deviations}")\nprint(f"Variance: {variance}, Std: {std:.4f}")\nprint(f"NumPy var: {np.var(data):.4f}, std: {np.std(data):.4f}")',output:'',status:'idle'},
      {id:3,cellTitle:'Stage 3 — Quartiles and Outlier Detection',
       prose:'IQR method identifies statistical outliers without assuming a distribution.',
       instructions:'Run. The value 100 is an outlier — far beyond Q3+1.5×IQR.',
       code:'import numpy as np\ndata = np.array([2,3,5,6,7,8,9,10,12,100])\nQ1 = np.percentile(data,25)\nQ3 = np.percentile(data,75)\nIQR = Q3 - Q1\nlower = Q1 - 1.5*IQR\nupper = Q3 + 1.5*IQR\noutliers = data[(data < lower) | (data > upper)]\nprint(f"Q1={Q1}, Q3={Q3}, IQR={IQR}")\nprint(f"Fence: [{lower:.1f}, {upper:.1f}]")\nprint(f"Outliers: {outliers}")',output:'',status:'idle'},
      {id:4,cellTitle:'Stage 4 — describe() Decoded',
       prose:'pandas describe() computes all summary stats at once. Read each row carefully.',
       instructions:'Run. The rows are: count, mean, std, min, 25%(Q1), 50%(median), 75%(Q3), max.',
       code:'import pandas as pd, numpy as np\nnp.random.seed(42)\ndf = pd.DataFrame({"symmetric":np.random.normal(50,10,200),"skewed":np.random.exponential(20,200)})\nprint(df.describe().round(2))',output:'',status:'idle'},
      {id:5,cellTitle:'Stage 5 — Visualizing Distributions',
       prose:'Plot the distribution to see the shape before trusting summary statistics.',
       instructions:'Run. The skewed distribution has mean much higher than median — visible in the plot.',
       code:'from opencalc import Figure\nimport numpy as np\nnp.random.seed(42)\ndata = np.random.exponential(20,200)\nmean_val = np.mean(data)\nmedian_val = np.median(data)\nfig = Figure(xmin=0,xmax=120,ymin=0,ymax=0.06,title="Skewed distribution")\nfig.grid().axes()\nfig.plot(lambda x: (1/20)*np.exp(-x/20) if x>0 else 0, color="blue", label="true PDF")\nfig.vline(mean_val, color="red")\nfig.vline(median_val, color="green")\nfig.text([mean_val+3,0.04],f"mean={mean_val:.1f}",color="red",align="left")\nfig.text([median_val-3,0.03],f"median={median_val:.1f}",color="green",align="right")\nfig.show()',output:'',status:'idle'},
      {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Full Stat Profile',
       difficulty:'medium',
       prompt:'Compute: mean_sales, median_sales, std_sales, and outliers (using 1.5×IQR rule). Store each. outliers should be a NumPy array of the outlier values.',
       instructions:'1. Compute mean, median, std with numpy.\n2. Compute Q1, Q3, IQR.\n3. Filter data for outlier values.',
       code:'import numpy as np\ndata=np.array([100,120,115,105,130,118,500,112,108,125,98,121,119,104,127])\nmean_sales = \nmedian_sales = \nstd_sales = \nQ1 = np.percentile(data,25)\nQ3 = np.percentile(data,75)\nIQR = Q3-Q1\noutliers = \n',output:'',status:'idle',
       testCode:`
if abs(mean_sales-data.mean())>0.1: raise ValueError(f"mean wrong: {mean_sales:.2f}")
if abs(median_sales-float(__import__('numpy').median(data)))>0.1: raise ValueError("median wrong")
if abs(std_sales-data.std())>0.1: raise ValueError("std wrong")
if 500 not in outliers: raise ValueError("500 should be in outliers")
res=f"SUCCESS: mean={mean_sales:.1f} vs median={median_sales}. The outlier 500 pulls the mean up significantly."
res
`,hint:'mean_sales=np.mean(data)\nmedian_sales=np.median(data)\nstd_sales=np.std(data)\noutliers=data[(data<Q1-1.5*IQR)|(data>Q3+1.5*IQR)]'},
    ]}}],
  },
  mentalModel:[
    'Mean = center of mass (pulled by outliers). Median = middle value (robust).',
    'Mean >> median → right-skewed. Mean << median → left-skewed.',
    'Variance = average squared deviation. Std = sqrt(variance), same units as data.',
    'IQR outlier fence: below Q1-1.5×IQR or above Q3+1.5×IQR.',
    'describe() rows: count, mean, std, min, Q1(25%), median(50%), Q3(75%), max.',
  ],
}
