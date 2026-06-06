export default {
  id: "stat2-004",
  slug: "bar-charts-and-pie-charts",
  chapter: "stat2",
  order: 4,
  title: "Bar Charts and Pie Charts",
  subtitle:
    "Displaying categorical frequencies â€” and knowing when each is appropriate.",
  tags: [
    "bar chart",
    "pie chart",
    "categorical data",
    "frequency",
    "proportion",
    "grouped bar",
    "stacked bar",
  ],
  aliases:
    "bar chart bar graph pie chart frequency proportion categorical data grouped bar stacked bar fig.bars fig.pie",
  timeToComplete: 35,
  coreConcept:
    "Bar charts display frequencies or proportions for one or more categorical variables. Pie charts display part-to-whole proportions for a single categorical variable. The choice between them depends on the number of categories, whether comparisons between categories matter, and whether a zero baseline is required.",
  prerequisites: ["stat2-002", "stat2-003"],
  nextLesson: "stat2-005",

  hook: {
    question:
      "A study has 400 survey responses: 120 Strongly Agree, 140 Agree, 80 Neutral, 45 Disagree, 15 Strongly Disagree. Which chart should you use, and what will it reveal?",
    realWorldContext:
      "A company surveys 400 employees about job satisfaction. The results are counts of responses in five ordered categories. A pie chart would show that SA+A together are 65% of responses â€” the majority are satisfied. But a bar chart would reveal something additional: the distribution is left-skewed (most responses cluster at the top) and the drop from Disagree (45) to Strongly Disagree (15) is steep. For five ordered Likert-scale categories, a bar chart sorted by category order is almost always better than a pie chart, because the ordinal structure (Strongly Disagree < Disagree < Neutral < Agree < Strongly Agree) is visible in the bar ordering but lost in a pie chart.",
  },

  intuition: {
    prose: [
      "**When to use a bar chart.** Use a bar chart when:\n- You have a single categorical variable and want to compare frequencies or proportions across categories.\n- You have two categorical variables and want to compare groups (grouped or stacked bars).\n- You have more than 5 categories (a pie chart becomes unreadable).\n- The categories have a natural order (ordinal: grades A/B/C/D/F, Likert scale, age groups).\n- Precise comparisons between categories matter (bar lengths are easier to compare than pie angles).",
      '**When to use a pie chart.** Use a pie chart when:\n- You have at most 5 categories (ideally 3â€“4).\n- The proportions differ enough to be visually distinct (no two slices of nearly equal size).\n- The emphasis is on part-to-whole composition, not comparison between specific parts.\n- You are showing a simple "majority/minority" message (e.g., 72% voted Yes).\n- The audience is non-technical and the chart will be in a presentation or infographic.',
      "**Before reading on, predict:** A market share report shows 6 brands with shares: 32%, 28%, 15%, 12%, 8%, 5%. Should you use a bar chart or a pie chart? Why?",
      '**Proportions vs. counts.** Bar charts can show either raw counts or proportions (percentages). Proportions are better when comparing two groups of different sizes (e.g., the satisfaction distribution for a department with 50 employees vs. one with 500). `df.groupby("dept")["satisfied"].value_counts(normalize=True)` gives proportions in pandas.',
      "**Grouped bar charts.** When you have one quantitative outcome and two categorical variables (e.g., exam pass rates by school AND by grade level), a grouped bar chart places bars for each inner category side-by-side within each outer category. Use `fig.bars()` with multiple color-coded series, or generate each group as a separate bars call with offset x-positions.",
      "**Sorting bars.** Unless the categorical variable is ordinal (has a natural order), sort bars by value (descending) to make the chart easier to read. `sorted(zip(values, labels), reverse=True)` gives the sorted order in Python.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Bar Chart vs. Pie Chart Decision",
        body: 'Step 1. Count the categories. More than 5? â†’ Bar chart (mandatory).\n\nStep 2. Are categories ordinal (naturally ordered)? â†’ Bar chart (maintains order).\n\nStep 3. Is the main message "how do these categories compare to each other"? â†’ Bar chart.\n\nStep 4. Is the main message "what fraction of the whole is each part"? AND â‰¤5 categories AND proportions clearly differ? â†’ Pie chart may work.\n\nStep 5. Will the audience need to read precise values? â†’ Bar chart (easier to judge bar height than slice angle).\n\nDefault: when in doubt, use a bar chart. Pie charts have a narrow appropriate use case.',
      },
      {
        type: "insight",
        title: "The Problem with Pie Charts",
        body: "Cognitive science research (Cleveland & McGill, 1984) established that humans estimate lengths more accurately than angles. In a bar chart, you judge length â€” a preattentive process. In a pie chart, you judge angle or arc â€” which requires more cognitive work.\n\nSpecifically:\n- Two adjacent pie slices of sizes 23% and 27% look nearly identical in a pie chart.\n- Two bars of heights 23 and 27 on the same axis are easily distinguishable.\n\nFor comparison tasks (which category is larger? by how much?), bar charts are almost always more accurate. Pie charts are primarily a part-to-whole encoding device â€” useful when the distinction is obvious (e.g., 75% vs. 25%).",
      },
      {
        type: "warning",
        title: "Common Bar Chart Errors",
        body: '1. **Skipping the zero baseline:** For bar charts, the y-axis must start at 0. Bar length encodes the full value from zero. A y-axis starting at 80% makes a 4% difference look like a 100% difference.\n\n2. **Double-encoding:** Coloring each bar a different color when the bars are all the same category type adds visual complexity without information. Use color to encode a second variable (group), not to decorate the first.\n\n3. **Too many bars:** More than 15â€“20 bars on one chart is hard to read. Consider grouping rare categories into "Other," or using a different visualization (e.g., treemap, dot chart).\n\n4. **Misleading proportions:** A bar chart of raw counts from groups of different sizes implies the groups are equally sized. If you compare departments with 50 vs. 500 employees, show proportions (%) not raw counts.',
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      "**Relative frequency (proportion).** For a categorical variable with $k$ categories and $n$ total observations, the relative frequency of category $j$ is $\\hat{p}_j = n_j / n$, where $n_j$ is the count in category $j$. The bar heights in a proportion bar chart sum to 1: $\\sum_{j=1}^k \\hat{p}_j = 1$. In a pie chart, each slice spans $\\hat{p}_j \\times 360Â°$ degrees.",
      "**Chi-square test preview.** The chi-square goodness-of-fit test (stat7) evaluates whether the observed frequency distribution $\\{n_1, n_2, \\ldots, n_k\\}$ is consistent with a hypothesized distribution $\\{e_1, e_2, \\ldots, e_k\\}$. The bar chart is the visual version of the same comparison: plot observed bar heights against expected heights. The test provides a p-value; the chart provides intuition about which categories deviate most from the expectation.",
    ],
  },

  rigor: {
    prose: [
      "**R1 â€” Ordinal vs. nominal categories and bar ordering.** Ordinal categories have a natural order that must be preserved in the x-axis: Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree. Nominal categories have no natural order (colors, country names, product types). For nominal categories, sorting by frequency (descending) maximizes the information in the chart â€” the reader sees immediately which categories are most and least common. Sorting alphabetically is a common default in software but is rarely the best choice for data visualization.",
      "**R2 â€” Mosaic plots for two-way categorical data.** A grouped bar chart works for two categorical variables when one variable has 2â€“4 categories. For richer two-way categorical comparisons (e.g., comparing the full distribution of a 5-level ordinal variable across 6 demographic groups), a mosaic plot or heat map may convey more information than a grouped bar chart. These are beyond the opencalc Figure API but are worth knowing exist.",
    ],
    visualizations: [],
  },

  python: {
    cells: [
      {
        id: 'stat2-004-py1',
        cellTitle: 'Bar Chart â€” Likert Scale Survey Responses',
        prose: `Likert scale data is ordinal (SD < D < N < A < SA). The bars must stay in that natural order â€” sorting by frequency would destroy the meaning. Run this cell to see the distribution.`,
        code: `import matplotlib.pyplot as plt
from collections import Counter

# Survey responses (Likert scale: SD=Strongly Disagree, D=Disagree, N=Neutral, A=Agree, SA=Strongly Agree)
responses = ["SA","A","A","N","SA","A","D","A","SA","N",
             "A","SA","D","A","N","SA","A","SD","A","SA",
             "A","N","A","SA","D","A","A","N","SA","A"]

counts = Counter(responses)
order = ["SD", "D", "N", "A", "SA"]
labels = [o for o in order if o in counts]
values = [counts[o] for o in labels]

print("Counts:", list(zip(labels, values)))
print("Total responses:", sum(values))

fig, ax = plt.subplots(figsize=(8, 5))
colors = ['#e74c3c', '#e67e22', '#95a5a6', '#3498db', '#2ecc71']
ax.bar(labels, values, color=colors, alpha=0.9, edgecolor='white')
ax.set_title('Survey Response Distribution (Likert Scale)', fontsize=13, fontweight='bold')
ax.set_xlabel('Response')
ax.set_ylabel('Count')
ax.set_ylim(0, max(values) + 2)

for i, (lbl, val) in enumerate(zip(labels, values)):
    ax.text(i, val + 0.3, str(val), ha='center', fontsize=11, fontweight='bold')

plt.tight_layout()
plt.show()`,
      },
      {
        id: 'stat2-004-py2',
        cellTitle: 'Proportion Bar Chart â€” Grouped Comparison',
        prose: `When comparing groups of different sizes, use proportions (not raw counts). This cell computes segment proportions for two cities and displays them side by side for comparison.`,
        code: `import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

data = {
    "city":    ["A","A","A","A","B","B","B","B","A","B","A","B"],
    "segment": ["Premium","Standard","Budget","Premium","Standard","Budget",
                "Premium","Standard","Standard","Budget","Budget","Premium"]
}
df = pd.DataFrame(data)

# Proportions per city
city_props = df.groupby("city")["segment"].value_counts(normalize=True).unstack(fill_value=0)
print("Segment proportions by city:")
print(city_props.round(3))

# Side-by-side bar chart
segments = city_props.columns.tolist()
x = np.arange(len(segments))
width = 0.35

fig, ax = plt.subplots(figsize=(9, 5))
ax.bar(x - width/2, city_props.loc['A'], width, label='City A', color='coral', alpha=0.85)
ax.bar(x + width/2, city_props.loc['B'], width, label='City B', color='steelblue', alpha=0.85)
ax.set_xticks(x); ax.set_xticklabels(segments)
ax.set_ylabel('Proportion'); ax.set_ylim(0, 0.65)
ax.set_title('Customer Segment Proportions by City', fontsize=12, fontweight='bold')
ax.legend()
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'stat2-004-py3',
        cellTitle: 'Pie Chart â€” Budget Allocation',
        prose: `A pie chart works here: only 4 categories, with clearly different proportions (64% vs 17% vs 14% vs 5%). Run this cell, then try adding a 5th category "Other: 30000" to see when pie charts become hard to read.`,
        code: `import matplotlib.pyplot as plt

categories = ["Personnel", "Equipment", "Travel", "Overhead"]
amounts = [450_000, 120_000, 35_000, 95_000]

total = sum(amounts)
print("Total budget: $", f"{total:,}")
print("Proportions:")
for cat, amt in zip(categories, amounts):
    print(f"  {cat:<12}: {amt/total*100:.1f}%  (\${amt:,})")

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Pie chart
colors = ['#3498db', '#2ecc71', '#e67e22', '#9b59b6']
wedges, texts, autotexts = axes[0].pie(
    amounts, labels=categories, autopct='%1.1f%%',
    colors=colors, startangle=90
)
axes[0].set_title('Budget Allocation (pie chart)', fontsize=12, fontweight='bold')

# Same data as a sorted bar chart â€” often more accurate for comparison
sorted_pairs = sorted(zip(amounts, categories), reverse=True)
amt_s, cat_s = zip(*sorted_pairs)
axes[1].bar(cat_s, amt_s, color=colors, alpha=0.85, edgecolor='white')
axes[1].set_title('Budget Allocation (bar chart â€” easier to compare)', fontsize=12, fontweight='bold')
axes[1].set_ylabel('Amount ($)')
axes[1].tick_params(axis='x', rotation=15)

plt.tight_layout()
plt.show()`,
      },
    ],
  },

  examples: [
    {
      id: "stat2-004-ex1",
      title: "When to use bar chart vs. pie chart",
      difficulty: "easy",
      problem:
        "For each scenario, justify the choice of chart type:\n(a) Six product categories with sales: Electronics=840, Clothing=520, Food=390, Toys=210, Books=175, Other=95.\n(b) Three payment methods with proportions: Credit=60%, Debit=28%, Cash=12%.\n(c) Five-point satisfaction scale responses: 1â˜…=12, 2â˜…=18, 3â˜…=35, 4â˜…=48, 5â˜…=37.",
      steps: [
        {
          expression: "\\text{(a) 6 categories â†’ bar chart}",
          annotation:
            "Six categories exceeds the recommended maximum for pie charts (5). Bar chart sorts by value (Electronics â†’ Other) for immediate comparison of relative size. The reader can see Electronics is nearly twice the size of Clothing.",
          strategyTitle: "(a) 6 categories: bar",
        },
        {
          expression:
            "\\text{(b) 3 categories, proportions â†’ pie chart acceptable}",
          annotation:
            'Three categories with clearly different proportions (60%, 28%, 12%) â€” the slices are visually distinct. A pie chart communicates "credit is the majority method" effectively. A bar chart would also work but the pie is fine here.',
          strategyTitle: "(b) 3 proportions: pie OK",
        },
        {
          expression: "\\text{(c) 5-level ordinal â†’ bar chart (ordered)}",
          annotation:
            "The 5-star scale is ordinal: order matters (1â˜… < 2â˜… < 3â˜… < 4â˜… < 5â˜…). A bar chart preserves this left-to-right ordering. A pie chart loses the ordinal structure â€” you cannot tell which slice is â˜…1 vs â˜…5 without labels, and the ordering conveys important meaning.",
          strategyTitle: "(c) Ordinal: bar (preserve order)",
        },
      ],
    },
    {
      id: "stat2-004-ex2",
      title: "Build a sorted bar chart with pandas",
      difficulty: "medium",
      problem:
        'A DataFrame `df` has a column "industry" with values (Technology, Finance, Healthcare, Education, Retail, Other). Build a bar chart showing count per industry, sorted from highest to lowest count.',
      steps: [
        {
          expression: '\\texttt{counts = df["industry"].value\\_counts()}',
          annotation:
            "`value_counts()` returns a Series sorted by count (highest first) by default. No manual sorting needed.",
          strategyTitle: "Step 1: Count with value_counts()",
        },
        {
          expression:
            "\\texttt{labels = counts.index.tolist()}\\\\\\texttt{values = counts.values.tolist()}",
          annotation:
            "Extract labels and values as Python lists. Labels are in order of decreasing count (value_counts() default).",
          strategyTitle: "Step 2: Extract lists",
        },
        {
          expression:
            "\\texttt{fig.axes(xmin=-1, xmax=6, ymin=0, ymax=max(values)+5)}",
          annotation:
            "Set ymax above the tallest bar. Using `max(values)+5` automatically adapts to the data.",
          strategyTitle: "Step 3: Axes",
        },
        {
          expression:
            '\\texttt{fig.bars(labels=labels, values=values, color="teal")}',
          annotation:
            "Build the bar chart. Because value_counts() sorted by frequency, bars automatically go from tallest to shortest.",
          strategyTitle: "Step 4: bars()",
        },
      ],
    },
    {
      id: "stat2-004-ex3",
      title: "Proportion chart for group comparison",
      difficulty: "medium",
      problem:
        "A survey asked 200 students at two schools whether they prefer online or in-person learning. School A: 80 students â€” 52 Online, 28 In-person. School B: 120 students â€” 66 Online, 54 In-person. Why should you display proportions rather than raw counts, and what are the proportions?",
      steps: [
        {
          expression:
            "\\text{School A proportion Online: } 52/80 = 0.65 = 65\\%",
          annotation: "School A: 65% prefer online, 35% prefer in-person.",
          strategyTitle: "Step 1: School A proportions",
        },
        {
          expression:
            "\\text{School B proportion Online: } 66/120 = 0.55 = 55\\%",
          annotation: "School B: 55% prefer online, 45% prefer in-person.",
          strategyTitle: "Step 2: School B proportions",
        },
        {
          expression:
            "\\text{Raw counts: School B has 66 vs. School A 52 â€” looks like School B prefers online more}",
          annotation:
            "But School B is 50% larger! Comparing raw counts of 52 and 66 is misleading because the group sizes differ. The correct comparison is 65% vs. 55%.",
          strategyTitle: "Step 3: Why proportions matter",
        },
        {
          expression:
            "\\text{Conclusion: School A (65\\%) has a stronger preference for online than School B (55\\%)}",
          annotation:
            "Proportions reveal the opposite conclusion from raw counts. Always use proportions when comparing categorical distributions across groups of different sizes.",
          strategyTitle: "Step 4: Correct conclusion",
        },
      ],
    },
  ],

  challenges: [
    {
      id: "stat2-004-ch1",
      title: "Build and interpret a complete bar chart",
      difficulty: "medium",
      problem:
        "An election received votes: Candidate A=12,450, B=9,870, C=5,230, D=2,100, E=870. (a) Compute each candidate's vote share as a percentage. (b) Write opencalc code to display a bar chart sorted from highest to lowest. (c) What does the chart reveal about the race structure?",
      walkthrough: [
        {
          expression: "\\text{Total} = 12450+9870+5230+2100+870 = 30520",
          annotation: "Sum all votes to compute the denominator.",
        },
        {
          expression:
            "p_A = 12450/30520 = 40.8\\%, \\quad p_B = 32.3\\%, \\quad p_C = 17.1\\%, \\quad p_D = 6.9\\%, \\quad p_E = 2.8\\%",
          annotation:
            "Each candidate's share. A and B together account for 73.2% of votes.",
        },
        {
          expression:
            '\\texttt{fig.axes(xmin=-1, xmax=5, ymin=0, ymax=45)}\\\\\\texttt{fig.bars(labels=["A","B","C","D","E"], values=[40.8,32.3,17.1,6.9,2.8])}',
          annotation:
            "Set ymax=45 (above the 40.8% max). Bars are already in descending order.",
        },
        {
          expression:
            "\\text{Structure: two-candidate race. A leads B by 8.5pp. C is a distant third.}",
          annotation:
            "The bar chart reveals: A and B dominate, C is the only plausible spoiler. If this is a two-round system, A vs. B is the clear runoff.",
        },
      ],
      answer:
        "Vote shares: A=40.8%, B=32.3%, C=17.1%, D=6.9%, E=2.8%. Bar chart (sorted descending) reveals a two-candidate dominant race with A leading by ~8.5 percentage points.",
    },
    {
      id: "stat2-004-ch2",
      title: "Critique and fix a misleading bar chart",
      difficulty: "hard",
      problem:
        'A bar chart shows quarterly profits: Q1=$8.2M, Q2=$8.7M, Q3=$8.5M, Q4=$9.1M. The y-axis runs from $8.0M to $9.2M. The chart is presented with the headline "Profits SURGE 12.5% in Q4." (a) Compute the actual Q1-to-Q4 change. (b) What does the truncated axis do? (c) Write the code for an honest version.',
      walkthrough: [
        {
          expression:
            "\\text{Actual change: } (9.1 - 8.2)/8.2 \\times 100 = 0.9/8.2 \\times 100 = 11.0\\%",
          annotation:
            'The actual Q1-to-Q4 change is 11.0%, not 12.5%. (Q4 vs. Q3 would be (9.1-8.5)/8.5 = 7.1%; Q4 vs. prior year would require more data. The "12.5%" in the headline is suspicious.)',
          strategyTitle: "Step 1: Actual change",
        },
        {
          expression:
            "\\text{Truncated axis: y from \\$8.0M makes Q1=\\$8.2M appear near-zero, Q4=\\$9.1M appears much taller}",
          annotation:
            "The Q4 bar appears to be about 9Ã— the height of the Q1 bar visually (0.9M difference out of a 1.2M axis range). The actual ratio of Q4 to Q1 is 9.1/8.2 = 1.11 â€” only 11% larger. The visual implies a much larger difference.",
          strategyTitle: "Step 2: Axis distortion",
        },
        {
          expression:
            '\\texttt{fig.axes(xmin=-1, xmax=4, ymin=0, ymax=11)}\\\\\\texttt{fig.bars(labels=["Q1","Q2","Q3","Q4"], values=[8.2,8.7,8.5,9.1])}',
          annotation:
            "y-axis starts at 0. Q4 bar is visually only slightly taller than Q1 â€” the true 11% difference is preserved. The reader can accurately judge the magnitude of the improvement.",
          strategyTitle: "Step 3: Honest chart",
        },
      ],
      answer:
        "Actual Q1-to-Q4 change is 11.0%. Truncated axis inflates visual difference by ~8Ã—. Honest chart starts y-axis at 0.",
    },
    ,
    {
      id: "stat2-004-ch3",
      title: "Applied Data Challenge",
      difficulty: "hard",
      problem:
        "Use a CSV dataset from data/applied-statistics, apply this lesson's core method, and report one result plus one limitation.",
      walkthrough: [
        {
          expression: "Import -> clean -> compute -> interpret",
          annotation: "Show each stage and justify one design choice.",
        },
      ],
      answer:
        "A complete response includes a reproducible computation, contextual interpretation, and a limitation statement tied to assumptions.",
    },
  ],

  semantics: {
    core: [
      {
        symbol: "\\hat{p}_j",
        meaning:
          "Sample proportion for category j = n_j / n. Bar height in a proportion chart.",
      },
      {
        symbol: "\\hat{p}_j \\times 360Â°",
        meaning: "Slice angle in a pie chart for category j.",
      },
      {
        symbol: "\\texttt{value\\_counts()}",
        meaning:
          "pandas method â€” counts occurrences of each unique value in a Series, sorted by frequency descending.",
      },
      {
        symbol: "\\texttt{value\\_counts(normalize=True)}",
        meaning: "Returns proportions (0 to 1) instead of counts.",
      },
    ],
    rulesOfThumb: [
      "More than 5 categories â†’ bar chart, always.",
      "Ordinal categories â†’ bar chart, always (preserves order).",
      "Group size comparison â†’ use proportions, not raw counts.",
      "Bar chart y-axis must start at 0.",
      "Sort nominal bars by value (descending) unless there is a natural order.",
      "Pie charts: use only for â‰¤5 clearly different proportions, part-to-whole message, non-technical audience.",
    ],
  },

  spiral: {
    recoveryPoints: [],
    futureLinks: [
      {
        lessonId: "stat7-001",
        label: "Chi-square Tests",
        note: "The bar chart frequencies you visualize here are tested formally in stat7: do observed frequencies match expected?",
      },
      {
        lessonId: "stat3-005",
        label: "Frequency Tables",
        note: "stat3-005 formalizes frequency distributions and relative frequencies that you visualize with bars and pie charts.",
      },
      {
        lessonId: "stat2-006",
        label: "Data Visualization Example",
        note: "The end-to-end EDA lesson uses bars and pie charts as part of a complete exploratory analysis.",
      },
    ],
  },

  definitions: [
    { term: "bar chart", definition: "A chart for categorical data where bar height encodes count, frequency, or a summary statistic for each category. Bars are separated by gaps (categories are discrete). Can be sorted by value for easier comparison. Preferred over pie charts for more than 5 categories or when precise comparison is needed." },
    { term: "grouped bar chart", definition: "A bar chart comparing two or more groups within each category. Bars for each group are placed side-by-side within each category. Best for comparing how a quantity differs across both categories and groups simultaneously. Requires a clear legend or direct labels." },
    { term: "stacked bar chart", definition: "A bar chart where segments of each bar represent sub-categories that sum to the total. Shows both the total and the composition. Harder to read than grouped bars for interior segments (only the bottom segment starts at 0). 100% stacked bars show proportions." },
    { term: "pie chart", definition: "A circular chart divided into slices proportional to each category's share of the whole. Appropriate only for 3–5 categories with clearly different proportions. Human visual perception of angles is less accurate than length — for comparison, a bar chart is almost always clearer. Never use pie charts with many similarly-sized slices." },
    { term: "frequency table", definition: "A table listing each category (or bin) alongside its count (frequency) and proportion (relative frequency). The foundation for bar and pie charts. Relative frequency = count / total; percentages = relative frequency × 100." },
    { term: "Pareto chart", definition: "A bar chart sorted in descending order of frequency, with a cumulative percentage line added on a secondary axis. Highlights which categories account for the most occurrences — the Pareto principle (80/20 rule) states that ~80% of effects come from ~20% of causes. Common in quality control." },
  ],

  checkpoints: [
    {
      id: "cp-stat2-004-1",
      label:
        "Read: state two conditions that favor a bar chart over a pie chart",
      type: "read",
    },
    {
      id: "cp-stat2-004-2",
      label:
        "Read: explain why proportions should be used when comparing groups of different sizes",
      type: "read",
    },
    {
      id: "cp-stat2-004-3",
      label: "Lab: run cell 1 and explain why bars are in SDâ†’SA order",
      type: "lab",
    },
    {
      id: "cp-stat2-004-4",
      label:
        "Apply the decision procedure to example 1 before reading the solution",
      type: "example",
    },
    {
      id: "cp-stat2-004-5",
      label:
        "Complete example 3: compute proportions for both schools before reading",
      type: "example",
    },
    {
      id: "cp-stat2-004-6",
      label:
        "Lab: run cell 3 (pie chart) and add a fifth category to test readability",
      type: "lab",
    },
    {
      id: "cp-stat2-004-7",
      label:
        "Attempt challenge 2: identify the axis distortion and write the honest chart code",
      type: "challenge",
    },
    {
      id: "cp-stat2-004-8",
      label:
        "Read: state the cognitive science reason bar charts outperform pie charts for comparison tasks",
      type: "read",
    },
  ],

  assessment: {
    questions: [
      {
        id: "stat2-004-assess-1",
        type: "choice",
        text: "A dataset has 12 different product categories. Which chart type is most appropriate for showing their frequencies?",
        options: [
          "Pie chart",
          "Bar chart sorted by frequency",
          "Histogram",
          "Line chart",
        ],
        answer: "Bar chart sorted by frequency",
        instructions:
          "12 categories is too many for a pie chart. A bar chart sorted by frequency lets the reader immediately identify the most and least common categories.",
      },
    ],
  },

  quiz: [
    {
      id: "stat2-004-quiz-1",
      type: "choice",
      text: "The main advantage of a bar chart over a pie chart for comparison tasks is:",
      options: [
        "Bar charts are more colorful",
        "Humans judge bar lengths more accurately than pie angles",
        "Bar charts can show more data types",
        "Pie charts cannot show more than 3 categories",
      ],
      answer: "Humans judge bar lengths more accurately than pie angles",
      hints: [
        "This comes from Cleveland & McGill (1984) cognitive science research.",
        "Which visual attribute is processed preattentively â€” length or angle?",
      ],
      reviewSection: "Insight callout â€” The Problem with Pie Charts",
    },
    {
      id: "stat2-004-quiz-2",
      type: "choice",
      text: "You are comparing the proportion of students who passed an exam in 4 different schools of sizes 80, 120, 95, and 210 students. You should display:",
      options: [
        "Raw counts (number of students who passed)",
        "Proportions (percentage who passed)",
        "The total number of students in each school",
        "A pie chart of total students across all schools",
      ],
      answer: "Proportions (percentage who passed)",
      hints: [
        "The schools have very different sizes â€” a school with 40 passing out of 80 is 50%, and a school with 80 passing out of 210 is 38%.",
        "Raw counts favor larger schools regardless of pass rate.",
      ],
      reviewSection: "Example 3 â€” Proportion chart for group comparison",
    },
    {
      id: "stat2-004-quiz-3",
      type: "choice",
      text: "A Likert scale (Strongly Disagree to Strongly Agree) should be displayed as:",
      options: [
        "A pie chart",
        "A bar chart with bars sorted by frequency",
        "A bar chart with bars in the natural Likert order (SDâ†’Dâ†’Nâ†’Aâ†’SA)",
        "A scatter plot",
      ],
      answer: "A bar chart with bars in the natural Likert order (SDâ†’Dâ†’Nâ†’Aâ†’SA)",
      hints: [
        "The Likert scale is ordinal â€” the order carries meaning.",
        "Sorting by frequency would destroy the scale's meaning.",
      ],
      reviewSection: "Rigor section â€” Ordinal vs. nominal categories",
    },
    {
      id: "stat2-004-quiz-4",
      type: "choice",
      text: "A pie chart with slices of 18%, 17%, 16%, 15%, 14%, 20% is problematic because:",
      options: [
        "The total does not add to 100%",
        "All slices are nearly equal in size and impossible to distinguish visually",
        "Pie charts cannot show 6 categories",
        "The largest slice should always be shown first",
      ],
      answer:
        "All slices are nearly equal in size and impossible to distinguish visually",
      hints: [
        "Pie charts work when proportions are clearly different.",
        "When all slices are 14â€“20%, no slice visually dominates.",
      ],
      reviewSection: 'Intuition â†’ "When to use a pie chart" paragraph',
    },
    {
      id: "stat2-004-quiz-5",
      type: "choice",
      text: 'In pandas, `df["category"].value_counts(normalize=True)` returns:',
      options: [
        "Counts of each unique value",
        "Proportions (values between 0 and 1) for each unique value",
        "Percentage labels formatted as strings",
        "A sorted list of unique values",
      ],
      answer: "Proportions (values between 0 and 1) for each unique value",
      hints: [
        "normalize=True divides each count by the total count.",
        "The values sum to 1.0, not to the total count.",
      ],
      reviewSection: "semantics â€” value_counts(normalize=True)",
    },
    {
      id: "stat2-004-quiz-6",
      type: "choice",
      text: "The y-axis of a bar chart must start at:",
      options: [
        "The minimum bar value",
        "Zero",
        "The mean of all bar values",
        "Any value as long as it is labeled",
      ],
      answer: "Zero",
      hints: [
        "Bar length encodes the full value from the baseline.",
        "A bar starting at 80% instead of 0% visually inflates differences.",
      ],
      reviewSection: "Warning callout â€” Common Bar Chart Errors",
    },
    {
      type: 'choice',
      question: `You want to compare Category A (n=150) vs Category B (n=400) on a success/fail outcome. Should you use raw counts or proportions?`,
      options: [
        `Raw counts â€” they show the absolute number of successes`,
        `Proportions â€” raw counts favor larger groups regardless of success rate`,
        `Neither â€” use a scatter plot instead`,
        `Raw counts for the bar chart, proportions only for the pie chart`,
      ],
      answer: `Proportions â€” raw counts favor larger groups regardless of success rate`,
      hints: [`If A has 90 successes out of 150 (60%) and B has 160 out of 400 (40%), raw counts make B look better. Proportions reveal that A actually has a higher rate.`],
      reviewSection: 'Cell 2 â€” proportion bar chart',
    },
    {
      type: 'choice',
      question: `In matplotlib, how do you create a grouped (side-by-side) bar chart for two groups A and B?`,
      options: [
        `plt.bar(categories, [a_vals, b_vals]) with two lists`,
        `Call plt.bar() twice with offset x positions (e.g., x - width/2 and x + width/2)`,
        `plt.grouped_bar(a_vals, b_vals)`,
        `plt.scatter() with different colors per group`,
      ],
      answer: `Call plt.bar() twice with offset x positions (e.g., x - width/2 and x + width/2)`,
      hints: [`Shift one set of bars left by half the bar width and the other right by half the bar width to create side-by-side groups.`],
      reviewSection: 'Cell 2 â€” grouped bar chart with numpy offset',
    },
    {
      type: 'choice',
      question: `The \`autopct='%1.1f%%'\` argument in plt.pie() controls:`,
      options: [
        `The color of each pie slice`,
        `The font size of the labels`,
        `The format string for percentage labels displayed inside each slice`,
        `Whether to show a legend`,
      ],
      answer: `The format string for percentage labels displayed inside each slice`,
      hints: [`autopct stands for "automatic percentage." '%1.1f%%' formats each percentage as a float with 1 decimal place followed by the % symbol.`],
      reviewSection: 'Cell 3 â€” pie chart with autopct',
    },
    {
      type: 'choice',
      question: `When should you add direct count labels above bars (as in cell 1)?`,
      options: [
        `Always â€” readers should never have to read the y-axis`,
        `When the exact values matter and the y-axis scale is hard to read precisely`,
        `Only when the chart has more than 10 bars`,
        `Never â€” it clutters the chart`,
      ],
      answer: `When the exact values matter and the y-axis scale is hard to read precisely`,
      hints: [`Direct labels (ax.text() above each bar) improve precision when exact counts matter. For large datasets with many bars, labels become cluttered and are better omitted.`],
      reviewSection: 'Cell 1 â€” annotating bar values',
    },
  ],

  misconceptions: [
    {
      falseBelief:
        "Pie charts are interchangeable with bar charts â€” they show the same information.",
      whyStudentsThinkIt:
        "Both show category frequencies. Students see them used interchangeably in business reports.",
      correctionExample:
        "A pie chart with 8 categories of similar size (10â€“15% each) is completely unreadable. A bar chart of the same data sorted by frequency is immediately informative. They share the same data but have very different readability.",
      contrastCase:
        "A pie chart with three categories (Yes=68%, No=21%, Unsure=11%) communicates the majority position instantly. The bar chart would work too, but neither is wrong here.",
    },
    {
      falseBelief: "More colorful bars make a bar chart more informative.",
      whyStudentsThinkIt:
        "Students see colorful charts in media and assume color adds information.",
      correctionExample:
        "Coloring each bar a different color in a single-variable bar chart adds visual noise without information. The reader must match each bar to a legend instead of reading the label directly. Use a single color for all bars when there is one categorical variable.",
      contrastCase:
        "In a grouped bar chart (two categorical variables), different colors per group are necessary to distinguish the groups. Color encodes the grouping variable â€” that is genuine information.",
    },
    {
      falseBelief: "Sorting bars alphabetically is the standard practice.",
      whyStudentsThinkIt:
        'Most software defaults to alphabetical ordering. Students see it as the "correct" order.',
      correctionExample:
        "A bar chart of countries sorted alphabetically (Albania â†’ Zimbabwe) makes it impossible to see which countries are most or least common. Sorting by frequency (highest to lowest) reveals the Pareto structure immediately.",
      contrastCase:
        "Exception: ordinal variables must keep their natural order regardless of frequency (Strongly Disagree â†’ Strongly Agree, Q1 â†’ Q4). Alphabetical is the right choice only if there is no better ordering and the reader needs to look up specific values by name.",
    },
  ],

  transferPrompts: [
    {
      situation:
        "A hospital tracks patient readmission rates by diagnosis group: Heart Disease=22%, Pneumonia=18%, Hip Fracture=14%, Diabetes=12%, COPD=11%, Cancer=9%, Other=14%. They want to present this to board members with no statistical background.",
      competingTechniques: [
        "Pie chart of all 7 categories",
        "Bar chart sorted by readmission rate (highest to lowest)",
        "Table of numbers",
      ],
      whyThisTechniqueWins:
        "A sorted bar chart is best: 7 categories is too many for a pie chart (some proportions are very close: 22% vs. 18%). A sorted bar chart immediately shows that Heart Disease has the highest readmission rate and COPD the lowest. A table requires the board to manually compare numbers. The bar chart makes the comparison effortless for a non-technical audience.",
    },
    {
      situation:
        "A retail company wants to show the distribution of sales across 5 product lines for two consecutive years, to see how the mix has shifted.",
      competingTechniques: [
        "Two separate pie charts (one per year)",
        "Grouped bar chart (one group per product line, two bars per group for each year)",
        "Stacked bar chart (two bars, one per year, with segments for each product line)",
      ],
      whyThisTechniqueWins:
        "Grouped bar chart is best for comparing year-over-year change within each product line â€” the reader directly compares the two bars side by side for each category. Stacked bars make it hard to compare non-bottom segments. Two pie charts require flipping between them mentally. With 5 product lines and 2 years, grouped bars with consistent colors per product line give the clearest year-over-year comparison.",
    },
  ],

  debugging: [
    {
      commonError:
        "fig.bars() produces a chart with one bar per unique raw value instead of per category.",
      symptom:
        'You passed raw survey response strings (e.g., 200 strings like "SA","A","N",...) to fig.bars() and got 200 individual bars.',
      whyItHappened:
        "fig.bars() expects pre-computed labels and values (not raw data). It uses your `labels` list as-is, creating one bar per item.",
      repairStrategy:
        "Pre-compute counts first: `from collections import Counter; counts = Counter(data)`. Then: `fig.bars(labels=list(counts.keys()), values=list(counts.values()))`. Or with pandas: `vc = pd.Series(data).value_counts(); fig.bars(labels=vc.index.tolist(), values=vc.values.tolist())`.",
    },
    {
      commonError:
        "Pie chart shows wrong proportions when you pass raw counts.",
      symptom:
        "You pass values=[50, 30, 20] to fig.pie() but the slices do not look like 50%, 30%, 20%.",
      whyItHappened:
        "This may be expected behavior â€” fig.pie() normalizes the values so they sum to 100% (proportional to their total). Passing [50, 30, 20] (total=100) gives 50%, 30%, 20%. Passing [500, 300, 200] (total=1000) gives the same visual result. If your values are already proportions (0.5, 0.3, 0.2), fig.pie() will normalize them again â€” converting 0.5 to 50/(0.5+0.3+0.2)*100 = 50% (same result here, but could differ if they don't sum to 1).",
      repairStrategy:
        "Check that your values represent the relative size of each category correctly. Both raw counts and proportions work as inputs to fig.pie() â€” the internal normalization handles either.",
    },
  ],

  mastery: {
    targetLevel:
      "Apply (Level 3) â€” given a dataset and an analytical question, select bar chart vs. pie chart with justification, compute proportions where needed, and write correct opencalc code including sorted labels and appropriate axes.",
    solveIndependently:
      "Given frequency data for a categorical variable, decide between bar and pie chart, sort nominal bars by frequency, write the complete opencalc code, and identify whether raw counts or proportions should be displayed.",
    explainVerbally:
      "Explain why bar charts are preferred over pie charts for comparison tasks using the cognitive science argument about angle vs. length perception.",
    detectIncorrectApplication:
      "Identify and fix: (1) pie chart with 8 nearly-equal categories; (2) bar chart with y-axis not starting at zero; (3) alphabetically-sorted bars for a nominal variable.",
    transferToUnfamiliar:
      "Given a novel categorical dataset (e.g., app usage categories, political party affiliation by region), design the complete visualization strategy: which chart(s), which axes, raw counts vs. proportions, sort order â€” and justify each decision.",
  },
};
