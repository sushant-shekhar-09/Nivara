# Formal Automated Leakage Audit Report — StudentMind AI

## 1. Leakage Boundary Governance
A critical vulnerability in educational mental health modeling is circular target prediction, where questionnaire items belonging to the target diagnostic construct (or its sum score) enter the feature set. 
StudentMind AI implements an automated **Zero-Tolerance Leakage Gatekeeper** (`audit_and_enforce_leakage`).

### Strictly Prohibited Columns
#### For Depression Screening Model (Target: PHQ-9 >= 10):
- `PHQ1` through `PHQ9` (Direct questionnaire items)
- `Depression Value` / `phq9_total` (Sum score)
- `Depression Label` / `elevated_depression` (Clinical categories)
- `GAD1` through `GAD7`, `Anxiety Value`, `Anxiety Label` (Cross-instrument shortcutting)

#### For Anxiety Screening Model (Target: GAD-7 >= 10):
- `GAD1` through `GAD7` (Direct questionnaire items)
- `Anxiety Value` / `gad7_total` (Sum score)
- `Anxiety Label` / `elevated_anxiety` (Clinical categories)
- `PHQ1` through `PHQ9`, `Depression Value`, `Depression Label` (Cross-instrument shortcutting)

---
## 2. Gatekeeper Negative Verification Test Results
The automated pipeline verified runtime exception handling by deliberately attempting to inject forbidden columns into the preprocessing pipeline:

| Test Case | Injected Column | Target Model | Expected Result | Actual Result | Verification Status |
|---|---|---|---|---|---|
| Injection Test 1 | `PHQ1` | Depression | `DataLeakageError` | `DataLeakageError` raised | **PASSED** |
| Injection Test 2 | `Anxiety Value` | Anxiety | `DataLeakageError` | `DataLeakageError` raised | **PASSED** |
| Canonical Input | Clean 18 Features | Both Models | Clean Execution | Clean Execution | **PASSED** |

---
## 3. Mutual Information & Feature Relevance Analysis
Mutual Information (MI) quantifies the non-linear dependency between candidate features and the screening targets without leaking any target information:

| Feature | Description | MI with Elevated Depression | MI with Elevated Anxiety |
|---|---|---|---|
| `pss_score` | Total reconstructed PSS-10 score (0-40) | **0.1412** | **0.1627** |
| `PSS3` | Nervous and stressed due to academic pressure | **0.0926** | **0.1237** |
| `PSS4` | Could not cope with mandatory academic activities | **0.0868** | **0.1096** |
| `PSS10` | Academic difficulties piling up | **0.0861** | **0.1095** |
| `PSS2` | Unable to control important academic things | **0.0793** | **0.0792** |
| `PSS1` | Upset due to academic events | **0.0787** | **0.0865** |
| `PSS9` | Angered by bad performance beyond control | **0.0560** | **0.0776** |
| `University` | Higher education institution name in Bangladesh | **0.0231** | **0.0234** |
| `PSS8` | Academic performance on top (reversed) | **0.0168** | **0.0000** |
| `Department` | Academic major or department category | **0.0077** | **0.0034** |
| `PSS7` | Able to control academic irritations (reversed) | **0.0050** | **0.0025** |
| `Academic_Year` | Current academic level / year of study | **0.0010** | **0.0107** |
| `Gender` | Self-identified gender | **0.0000** | **0.0000** |
| `Age` | Age bracket of university student | **0.0000** | **0.0138** |
| `waiver_or_scholarship` | Tuition scholarship or financial waiver recipient status | **0.0000** | **0.0000** |
| `Current_CGPA` | Cumulative Grade Point Average bracket | **0.0000** | **0.0045** |
| `PSS6` | Academic life going student's way (reversed) | **0.0000** | **0.0043** |
| `PSS5` | Confident handling academic problems (reversed) | **0.0000** | **0.0126** |

> [!NOTE]
> High mutual information with `pss_score` and individual PSS items demonstrates strong psychological relevance of perceived stress to elevated anxiety and depression, without any circularity or mathematical leakage.