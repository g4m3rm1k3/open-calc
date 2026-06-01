# Applied Statistics I (Semester 1) - Gold Standard Curriculum

This plan is designed for first-semester university STEM students and aligned to the lesson standard in docs/lesson-writing-standard.md.

## Course Outcomes

By the end of semester, students can:

- Build and interpret confidence intervals for means and proportions.
- Select appropriate visualizations and descriptive summaries from real datasets.
- Apply probability rules and conditional probability for decision scenarios.
- Fit and diagnose a simple linear regression from CSV data.
- Communicate uncertainty, assumptions, and model limitations.

## Weekly Structure (14 weeks)

1. Week 1: stat1-001, stat1-002
2. Week 2: stat1-003, stat1-004
3. Week 3: stat1-005 + notebook project 1
4. Week 4: stat2-001, stat2-002
5. Week 5: stat2-003, stat2-004
6. Week 6: stat2-005, stat2-006 + notebook project 2
7. Week 7: stat3-001, stat3-002
8. Week 8: stat3-003, stat3-004
9. Week 9: stat3-005, stat3-006 + notebook project 3
10. Week 10: stat4-001, stat4-002
11. Week 11: stat4-003, stat4-004
12. Week 12: stat4-005, stat4-006 + notebook project 4
13. Week 13: Integrative review, mixed inference + modeling lab
14. Week 14: Capstone data report and oral defense

## Required Notebook Labs

- docs/notebooks/applied-statistics/stat101-week01-foundations.ipynb
- docs/notebooks/applied-statistics/stat101-week03-confidence-intervals.ipynb
- docs/notebooks/applied-statistics/stat101-week06-visualization.ipynb
- docs/notebooks/applied-statistics/stat101-week09-descriptive-stats.ipynb
- docs/notebooks/applied-statistics/stat101-week12-probability.ipynb
- docs/notebooks/applied-statistics/stat101-week14-capstone.ipynb

## CSV Datasets (starter)

- data/applied-statistics/study_hours_scores.csv
- data/applied-statistics/manufacturing_defects.csv
- data/applied-statistics/health_trial.csv

## Gold Standard QA Gate

Run:

```bash
node scripts/validate_applied_statistics_gold_standard.mjs
```

The checker flags lesson files missing required fields and minimum instructional elements.
