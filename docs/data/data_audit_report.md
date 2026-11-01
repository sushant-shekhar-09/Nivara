# Comprehensive Data Audit & Target Reconstruction Report — StudentMind AI

## 1. Executive Summary & Verification Metrics
This audit establishes the empirical baseline for the primary Bangladesh university student cohort (`Processed.csv`, DOI: `10.6084/m9.figshare.25771164`). 
All questionnaire scoring methodologies were verified independently against source item responses.

| Metric | Audit Value | Assessment |
|---|---|---|
| Raw Total Records | **2028** | Conforms to Figshare publication |
| Total Columns | **39** | Complete item-level + demographic schema |
| Missing Values | **0** | Complete dataset (0 missing fields) |
| Exact Duplicate Rows | **6** | Row indices: `[492, 533, 763, 1120, 1362, 1369]` |
| Deduplicated Total ($N$) | **2022** | Clean analytical baseline |
| Reconstructed GAD-7 Match | **100.0%** (2028/2028) | Verified zero discrepancy |
| Reconstructed PHQ-9 Match | **100.0%** (2028/2028) | Verified zero discrepancy |
| Reconstructed PSS-10 Match (Rev 5,6,7,8) | **100.0%** (2028/2028) | Reverse scoring formulation empirically proven |

---

## 2. Duplicate Sensitivity & Handling Policy
An exact audit across all 39 columns identified **6 identical records** at row indices [492, 533, 763, 1120, 1362, 1369].
These records represent identical multi-item survey submissions, indicating duplicate form submissions during survey collection.

> [!IMPORTANT]
> **Deduplication Policy:** All downstream machine learning pipelines, cross-validation grouping, and statistical evaluations strictly operate on the deduplicated baseline of **N = 2,022** records. The 6 duplicate records are formally quarantined rather than silently deleted.

---

## 3. Psychometric Reconstruction & Reverse Scoring

### A. PHQ-9 (Patient Health Questionnaire-9)
- **Formulation:** $\text{PHQ-9} = \sum_{i=1}^{9} \text{PHQ}_i$
- **Item Range:** $0$ ('Not at all') to $3$ ('Nearly every day')
- **Total Scale Range:** $0$ to $27$
- **Reconstruction Result:** **2028 exact matches out of 2028** (100.00% match, 0 mismatches).

### B. GAD-7 (Generalized Anxiety Disorder-7)
- **Formulation:** $\text{GAD-7} = \sum_{i=1}^{7} \text{GAD}_i$
- **Item Range:** $0$ ('Not at all') to $3$ ('Nearly every day')
- **Total Scale Range:** $0$ to $21$
- **Reconstruction Result:** **2028 exact matches out of 2028** (100.00% match, 0 mismatches).

### C. PSS-10 (Perceived Stress Scale-10)
- **Formulation:**
  $$\text{PSS-10} = \text{PSS}_1 + \text{PSS}_2 + \text{PSS}_3 + \text{PSS}_4 + (4 - \text{PSS}_5) + (4 - \text{PSS}_6) + (4 - \text{PSS}_7) + (4 - \text{PSS}_8) + \text{PSS}_9 + \text{PSS}_{10}$$
- **Item Range:** $0$ ('Never') to $4$ ('Very Often')
- **Total Scale Range:** $0$ to $40$
- **Reverse Scoring Verification:** In standard Cohen's PSS-10, items 4, 5, 7, and 8 are positively phrased. In the questionnaire administered for this dataset, item 4 ('could not cope') was placed before item 5 ('felt confident'), shifting the four positive statements precisely to items 5, 6, 7, and 8. Reverse scoring $(4 - x)$ on items 5, 6, 7, and 8 yields **100.00% exact matches (2,028/2,028)** with the supplied `Stress Value`.

---

## 4. Primary Target Definitions & Class Balance (Deduplicated N = 2,022)

| Screening Target | Operational Definition | Positive ($Y=1$) | Negative ($Y=0$) | Prevalence (%) | Imbalance Ratio |
|---|---|---|---|---|---|
| **Elevated Depression Risk** | PHQ-9 >= 10 | 1470 | 552 | **72.7%** | 1 : 0.38 |
| **Elevated Anxiety Risk** | GAD-7 >= 10 | 1361 | 661 | **67.31%** | 1 : 0.49 |

> [!NOTE]
> A cutoff score of $\ge 10$ on both the PHQ-9 (Kroenke et al., 2001) and GAD-7 (Spitzer et al., 2006) represents the internationally validated clinical threshold for moderate-to-severe symptomatology, indicating a recommended screening flag for further evaluation.

---

## 5. University Clusters & Sample Sizes (Deduplicated N = 2,022)

The dataset spans 37 distinct higher-education institutions in Bangladesh, exhibiting substantial variation in cluster sample sizes:

| University | Sample Size ($N$) | Cohort Share (%) | Depression Prev (%) | Anxiety Prev (%) |
|---|---|---|---|---|
| Independent University, Bangladesh (IUB) | 530 | 26.21% | 74.72% | 71.32% |
| American International University Bangladesh (AIUB) | 503 | 24.88% | 66.6% | 59.24% |
| Islamic University of Technology (IUT) | 269 | 13.3% | 86.62% | 82.53% |
| Dhaka University (DU) | 200 | 9.89% | 71.0% | 68.0% |
| Dhaka University of Engineering and Technology (DUET) | 162 | 8.01% | 66.05% | 53.09% |
| North South University (NSU) | 87 | 4.3% | 74.71% | 75.86% |
| Bangladesh University of Engineering and Technology (BUET) | 63 | 3.12% | 57.14% | 49.21% |
| Patuakhali Science and Technology University | 50 | 2.47% | 68.0% | 58.0% |
| East West University (EWU) | 42 | 2.08% | 92.86% | 80.95% |
| Rajshahi University of Engineering and Technology (RUET) | 31 | 1.53% | 67.74% | 74.19% |
| Rajshahi University (RU) | 23 | 1.14% | 69.57% | 60.87% |
| BRAC University | 19 | 0.94% | 78.95% | 68.42% |
| United International University (UIU) | 18 | 0.89% | 77.78% | 77.78% |
| Bangladesh Agricultural University (BAU) | 14 | 0.69% | 57.14% | 50.0% |
| Daffodil University | 11 | 0.54% | 81.82% | 90.91% |

> [!WARNING]
> **Grouping Imperative:** Because students are grouped within distinct university cultures, academic environments, and grading systems, standard random train/test splitting leads to cross-campus data leakage and inflated generalization metrics. Model evaluation MUST use `StratifiedGroupKFold` grouped by `University`.

---

## 6. Safety Audit — PHQ-9 Item 9 (Self-Harm / Suicide Ideation)
Question: *'In a semester, how often have you had thoughts that you would be better off dead, or of hurting yourself?'*

| Response Level | Value | Frequency | Share (%) |
|---|---|---|---|
| 0 (Not at all) | 0 | 775 | 38.21% |
| 1 (Several days) | 1 | 519 | 25.59% |
| 2 (More than half the days) | 2 | 335 | 16.52% |
| 3 (Nearly every day) | 3 | 399 | 19.67% |

**Total Endorsing Any Self-Harm Thought (Score $\ge 1$):** 1253 students (61.79%).

> [!CAUTION]
> **Deterministic Safety Requirement:** The ML classification model MUST NOT attempt to predict suicide ideation. A deterministic safety pathway directly intercepts any response $\ge 1$ on PHQ-9 Item 9 to present immediate emergency and mental-health crisis resources.