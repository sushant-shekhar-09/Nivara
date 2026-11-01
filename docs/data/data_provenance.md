# Data Provenance & Dataset Registry — StudentMind AI

## 1. Overview
This document establishes the official data provenance record for the StudentMind AI project. 
In accordance with project governance standards, all raw datasets are maintained as immutable sources of truth in `data/raw/`. 
Every file has been verified with cryptographic SHA-256 checksums, dimensional audits, and explicit methodological scoping.

| Dataset Key | Dataset Name | DOI | Role | License |
|---|---|---|---|---|
| `25771164_bangladesh` | MHP (Anxiety, Stress, Depression) Dataset of University Students (Bangladesh) | [10.6084/m9.figshare.25771164](https://doi.org/10.6084/m9.figshare.25771164) | Primary ML training, validation, cross-validation, and evaluation | CC BY 4.0 |
| `10423537_xinxiang` | Temporal Dynamics in Psychological Assessments (Xinxiang Medical University, China) | [10.5281/zenodo.10423537](https://doi.org/10.5281/zenodo.10423537) | Secondary research / external cohort analysis / psychometric validation (NOT merged for primary training) | Creative Commons Attribution 4.0 International |
| `24052236_uk` | UK University Student Mental Health Dataset | [10.6084/m9.figshare.24052236.v2](https://doi.org/10.6084/m9.figshare.24052236.v2) | Secondary research / cross-national validation / comorbidity exploration (NOT merged for primary training) | CC BY 4.0 |

---

## 2. Dataset Files, Dimensions & Integrity Checksums

### MHP (Anxiety, Stress, Depression) Dataset of University Students (Bangladesh) (`25771164_bangladesh`)
- **DOI**: [10.6084/m9.figshare.25771164](https://doi.org/10.6084/m9.figshare.25771164)
- **Purpose**: Primary ML training, validation, cross-validation, and evaluation
- **License**: CC BY 4.0
- **Citation**: Hasan, M. et al. (2024). MHP (Anxiety, Stress, Depression) Dataset of University Students. Figshare. https://doi.org/10.6084/m9.figshare.25771164
- **Known Limitations**: Cross-sectional self-reported survey in Bangladeshi university students; non-clinical sample; unverified institutional IDs; self-selection bias.

| Filename | Size (Bytes) | Row Count | Column Count | SHA-256 Checksum |
|---|---|---|---|---|
| `Anxiety.csv` | 341,614 | 2028 | 16 | `d436f96e982c2716...e3cd35a0` |
| `Depression.csv` | 361,487 | 2028 | 18 | `2e0eae7cf223689a...f49818fc` |
| `Processed.csv` | 505,100 | 2028 | 39 | `0a72bb3b7300b115...8feed726` |
| `Raw Dataset.csv` | 1,265,089 | 2028 | 33 | `30988a2611ee0669...a4e7c378` |
| `Stress.csv` | 359,303 | 2028 | 19 | `7b71f33a6eadda23...33f4fd41` |
| `Supplementary file -Questionnaire.pdf` | 1,232,647 | N/A | N/A | `ebfb219b4a648330...776b9d2d` |

#### Full Checksums:
- `Anxiety.csv`: `d436f96e982c271650b37c2477326c2f9eb23931f155475dea04ff7de3cd35a0`
- `Depression.csv`: `2e0eae7cf223689a0dceb70287579057508c17f9eefbb8dbfb472ff0f49818fc`
- `Processed.csv`: `0a72bb3b7300b115f92af897608b9722e81de0b0f23473025e8bac078feed726`
- `Raw Dataset.csv`: `30988a2611ee06690d67159967c1abe81cdd119f2b996e45c91eb3c3a4e7c378`
- `Stress.csv`: `7b71f33a6eadda237c718f9487eb02fd8c9158787fab816529cea36733f4fd41`
- `Supplementary file -Questionnaire.pdf`: `ebfb219b4a648330aab41fa6e989dca729f8017bb2bcac8aeb2902df776b9d2d`

### Temporal Dynamics in Psychological Assessments (Xinxiang Medical University, China) (`10423537_xinxiang`)
- **DOI**: [10.5281/zenodo.10423537](https://doi.org/10.5281/zenodo.10423537)
- **Purpose**: Secondary research / external cohort analysis / psychometric validation (NOT merged for primary training)
- **License**: Creative Commons Attribution 4.0 International
- **Citation**: Gong, W. et al. (2023). Temporal Dynamics in Psychological Assessments. Zenodo. https://doi.org/10.5281/zenodo.10423537
- **Known Limitations**: Medical student cohort in China; distinct cultural and language context; distinct demographic distributions; not directly comparable without domain adaptation.

| Filename | Size (Bytes) | Row Count | Column Count | SHA-256 Checksum |
|---|---|---|---|---|
| `demographic.csv` | 1,805,908 | 24292 | 6 | `33247e3a6f1a8d9b...564af693` |
| `gad7.csv` | 1,375,746 | 24292 | 16 | `e47ec29e61f30cad...b021218f` |
| `isi.csv` | 1,378,464 | 24292 | 16 | `3e748c0fd7827a27...ad0d6889` |
| `phq9.csv` | 1,717,995 | 24292 | 20 | `0e837b6cf289c408...51b9aece` |
| `pss.csv` | 2,585,243 | 24292 | 30 | `ad844acb6c4239be...8da46397` |

#### Full Checksums:
- `demographic.csv`: `33247e3a6f1a8d9b64da54ab8f482b1bf26decfa3a825398d8c5d4d7564af693`
- `gad7.csv`: `e47ec29e61f30cadee85ed66d39092fa47f41fecb47544f30626fc33b021218f`
- `isi.csv`: `3e748c0fd7827a271bcd7347a5ca442445596be9c6dbe51743661111ad0d6889`
- `phq9.csv`: `0e837b6cf289c4083ebd131e6bc7a52d63eefae3113a8738b57eb8ef51b9aece`
- `pss.csv`: `ad844acb6c4239be4daf2400bb101dda770b41989523c5c7185c6c468da46397`

### UK University Student Mental Health Dataset (`24052236_uk`)
- **DOI**: [10.6084/m9.figshare.24052236.v2](https://doi.org/10.6084/m9.figshare.24052236.v2)
- **Purpose**: Secondary research / cross-national validation / comorbidity exploration (NOT merged for primary training)
- **License**: CC BY 4.0
- **Citation**: Akram, U. et al. (2023). UK University Student Mental Health Dataset. Figshare. https://doi.org/10.6084/m9.figshare.24052236.v2
- **Known Limitations**: UK higher-education cohort; diverse higher-level psychometric battery (MDQ, SCI, SBQ-R); different demographic structures.

| Filename | Size (Bytes) | Row Count | Column Count | SHA-256 Checksum |
|---|---|---|---|---|
| `Akram et al 2023 Student MH Data UK SciData.sav` | 2,390,110 | 1408 | 112 | `e83abd9761060158...0e55e342` |
| `Akram et al 2023 Student MH Data UK SciData.xlsx` | 490,193 | 1408 | 112 | `e04b2a75dd4c4602...a0ae4e64` |
| `Variable codes and abbreviations .pdf` | 108,260 | N/A | N/A | `71f46254d4eaa287...5fbd7b7c` |

#### Full Checksums:
- `Akram et al 2023 Student MH Data UK SciData.sav`: `e83abd97610601585bf8ae5f023820db7a089c3cd3c335f4be901cb40e55e342`
- `Akram et al 2023 Student MH Data UK SciData.xlsx`: `e04b2a75dd4c46021c8520ba013fada3db73d03a694fea6afc06769ca0ae4e64`
- `Variable codes and abbreviations .pdf`: `71f46254d4eaa287fb72679c2032129c3f5f3f088e985a4629985df15fbd7b7c`

---
## 3. Immutability Policy
1. **No In-Place Modifications:** Files in `data/raw/` must never be edited, cleaned, or rewritten.
2. **Pipeline Reproduction:** All downstream interim datasets (`data/interim/`) and processed datasets (`data/processed/`) are derived strictly via version-controlled scripts.
3. **Checksum Verification:** The CI/CD and evaluation pipelines verify file hashes against `data/dataset_manifest.json` before training.