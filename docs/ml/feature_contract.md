# Formal Feature Contract (v1.0.0) — StudentMind AI

## 1. Specification Overview
The feature contract defines the single source of truth for all input variables consumed by the primary ML screening models. 
To guarantee clinical and methodological defensibility, **target-derived variables and direct diagnostic items are strictly banned** from the feature space.

| Feature Name | Storage Type | Category | Range / Categories | Depression Allowed | Anxiety Allowed | Leakage Audit |
|---|---|---|---|---|---|---|
| `Age` | `category` | categorical | 5 classes | YES | YES | Clean (Self-reported pre-screening context) |
| `Gender` | `category` | categorical | 3 classes | YES | YES | Clean (Self-reported pre-screening context) |
| `University` | `category` | categorical | 16 classes | YES | YES | Clean (Institutional grouping factor) |
| `Department` | `category` | categorical | 12 classes | YES | YES | Clean (Academic context) |
| `Academic_Year` | `category` | categorical | 5 classes | YES | YES | Clean (Academic context) |
| `Current_CGPA` | `category` | categorical | 6 classes | YES | YES | Clean (Academic performance indicator) |
| `waiver_or_scholarship` | `category` | categorical | 2 classes | YES | YES | Clean (Financial/academic stressor proxy) |
| `PSS1` | `int` | ordinal | 0 - 4 | YES | YES | Clean (Standard perceived stress instrument) |
| `PSS2` | `int` | ordinal | 0 - 4 | YES | YES | Clean |
| `PSS3` | `int` | ordinal | 0 - 4 | YES | YES | Clean |
| `PSS4` | `int` | ordinal | 0 - 4 | YES | YES | Clean |
| `PSS5` | `int` | ordinal | 0 - 4 | YES | YES | Clean |
| `PSS6` | `int` | ordinal | 0 - 4 | YES | YES | Clean |
| `PSS7` | `int` | ordinal | 0 - 4 | YES | YES | Clean |
| `PSS8` | `int` | ordinal | 0 - 4 | YES | YES | Clean |
| `PSS9` | `int` | ordinal | 0 - 4 | YES | YES | Clean |
| `PSS10` | `int` | ordinal | 0 - 4 | YES | YES | Clean |
| `pss_score` | `int` | numeric | 0 - 40 | YES | YES | Clean |

---
## 2. Demographic & Academic Feature Details
### `Age`
- **Description:** Age bracket of university student
- **Allowed Categories:** `Below 18`, `18-22`, `23-26`, `27-30`, `Above 30`
- **Handling of Unseen Categories:** Mapped safely to fallback category (`18-22`).

### `Gender`
- **Description:** Self-identified gender
- **Allowed Categories:** `Male`, `Female`, `Prefer not to say`
- **Handling of Unseen Categories:** Mapped safely to fallback category (`Prefer not to say`).

### `University`
- **Description:** Higher education institution name in Bangladesh
- **Allowed Categories:** `Independent University, Bangladesh (IUB)`, `American International University Bangladesh (AIUB)`, `Islamic University of Technology (IUT)`, `Dhaka University (DU)`, `Dhaka University of Engineering and Technology (DUET)`, `North South University (NSU)`, `Bangladesh University of Engineering and Technology (BUET)`, `Patuakhali Science and Technology University`, `East West University (EWU)`, `Rajshahi University of Engineering and Technology (RUET)`, `Rajshahi University (RU)`, `BRAC University`, `United International University (UIU)`, `Bangladesh Agricultural University (BAU)`, `Daffodil University`, `Other`
- **Handling of Unseen Categories:** Mapped safely to fallback category (`Other`).

### `Department`
- **Description:** Academic major or department category
- **Allowed Categories:** `Engineering - CS / CSE / CSC / Similar to CS`, `Business and Entrepreneurship Studies`, `Engineering - EEE/ ECE / Similar to EEE`, `Biological Sciences`, `Other`, `Engineering - Mechanical Engineering / Similar to ME`, `Engineering - Civil Engineering / Similar to CE`, `Environmental and Life Sciences`, `Engineering - Other`, `Pharmacy and Public Health`, `Liberal Arts and Social Sciences`, `Law and Human Rights`
- **Handling of Unseen Categories:** Mapped safely to fallback category (`Other`).

### `Academic_Year`
- **Description:** Current academic level / year of study
- **Allowed Categories:** `First Year or Equivalent`, `Second Year or Equivalent`, `Third Year or Equivalent`, `Fourth Year or Equivalent`, `Other`
- **Handling of Unseen Categories:** Mapped safely to fallback category (`First Year or Equivalent`).

### `Current_CGPA`
- **Description:** Cumulative Grade Point Average bracket
- **Allowed Categories:** `Below 2.50`, `2.50 - 2.99`, `3.00 - 3.39`, `3.40 - 3.79`, `3.80 - 4.00`, `Other`
- **Handling of Unseen Categories:** Mapped safely to fallback category (`Other`).

### `waiver_or_scholarship`
- **Description:** Tuition scholarship or financial waiver recipient status
- **Allowed Categories:** `Yes`, `No`
- **Handling of Unseen Categories:** Mapped safely to fallback category (`No`).

---
## 3. Perceived Stress Scale (PSS-10) Features
The 10 items of the Cohen Perceived Stress Scale (academically contextualized) capture psychological appraisal of academic pressures over the semester. 
Items are evaluated on an ordinal scale $0$ to $4$. Total `pss_score` is reconstructed using verified reverse-scoring of items 5, 6, 7, and 8:

$$\text{pss\_score} = \sum_{i \in \{1,2,3,4,9,10\}} \text{PSS}_i + \sum_{j \in \{5,6,7,8\}} (4 - \text{PSS}_j)$$