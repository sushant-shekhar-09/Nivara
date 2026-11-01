# Pipeline Reproducibility Instructions

This document provides step-by-step, deterministic commands to reproduce every phase of the StudentMind AI project from raw immutable datasets through feature engineering, cross-validation benchmarking, calibration, SHAP explainability, artifact freezing, automated testing, and web deployment.

---

## 1. System Requirements & Environment Setup

- **Operating System:** Windows 10/11, macOS, or Linux
- **Python Version:** Python 3.11.x
- **Node.js Version:** Node.js v20+ (v25 tested)
- **Database:** PostgreSQL 16 (running locally on port 5432)

### A. Python Environment Setup
```bash
# Clone or navigate to repository root
cd "d:/Projects/Mental Health Assistance ML-Project"

# Install package in editable mode with development dependencies
pip install -e .
pip install pytest pytest-asyncio uvicorn httpx
```

### B. Database Setup (PostgreSQL 16)
Ensure PostgreSQL 16 is active on `localhost:5432` with credentials:
- **User:** `postgres`
- **Password:** `postgres`
- **Database:** `studentmind`

Run database migrations:
```bash
alembic upgrade head
```

---

## 2. End-to-End Pipeline Reproduction

### Step 1: Raw Data Hash & Provenance Verification
Verify the immutable raw data hashes against the official manifest:
```bash
python scripts/verify_provenance.py
```
*Output: Verifies SHA-256 signatures for all 14 files across Bangladesh, Xinxiang, and UK cohorts.*

### Step 2: Data Audit & Psychometric Score Reconstruction
Re-run the audit on the raw Bangladesh dataset ($N = 2,028 \to 2,022$ clean after dropping 6 exact duplicate rows):
```bash
python scripts/phase2_data_audit.py
```
*Output: `data/bangladesh_audit_summary.json` (100% exact match on PHQ-9, GAD-7, and PSS-10 reverse scoring).*

### Step 3: Leakage Audit & Feature Contract Validation
Validate that prohibited target items (`PHQ1-9`, `GAD1-7`) are strictly intercepted:
```bash
python nivara/features/contract.py
```
*Output: Confirms zero target leakage and produces canonical 18-feature schema v1.0.0.*

### Step 4: Exploratory Data Analysis (EDA) & Group Clustering
Compute group clustering statistics across universities and feature distributions:
```bash
python scripts/phase4_eda.py
```
*Output: `data/eda_statistical_summary.json` (Confirms $p < 10^{-7}$ institutional variation).*

### Step 5: 5-Fold StratifiedGroupKFold ML Benchmarking, Threshold Tuning & Calibration
Run the model comparison benchmark across Logistic Regression, Random Forest, and XGBoost:
```bash
python scripts/phase5_6_7_ml_pipeline.py
```
*Output: `data/ml_benchmark_results.json` (Confirms Random Forest winner: Depression ROC-AUC $0.8145$, Anxiety ROC-AUC $0.8328$, tuned thresholds $0.434$ & $0.430$).*

### Step 6: TreeSHAP Explainability Verification
Calculate TreeSHAP values, global importance, and audit explainability text for non-causal compliance:
```bash
python scripts/phase8_shap_verification.py
```
*Output: `data/shap_global_importance.json` (Confirms 0 prohibited causal tokens and matches model predictions).*

### Step 7: Secondary Dataset Research (China-Xinxiang & UK)
Process secondary cohorts to assess insomnia comorbidity and cross-national prevalence:
```bash
python scripts/phase9_secondary_research.py
```
*Output: `data/secondary_research_summary.json` ($N = 24,292$ China and $N = 1,408$ UK analyses).*

### Step 8: Freeze Production Model Artifacts
Serialize the validated pipelines, feature schemas, thresholds, and SHA-256 manifests into immutable artifact directories:
```bash
python scripts/phase10_freeze_artifacts.py
```
*Output: Serializes `artifacts/depression/model_bundle.joblib` and `artifacts/anxiety/model_bundle.joblib`.*

---

## 3. Automated Test Suite Execution

Run the complete 24-test verification suite covering Data, ML, Artifacts, Safety, Privacy, Backend API, and E2E journeys:
```bash
pytest -v tests/
```
*Expected Result: 24 passed in ~6.5 seconds.*

---

## 4. Launching the Web Application

### Backend Service (FastAPI)
```bash
uvicorn nivara.backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive OpenAPI documentation will be accessible at: `http://127.0.0.1:8000/docs`

### Frontend Application (React + Vite)
```bash
cd frontend
npm install
npm run build    # Or 'npm run dev' for development server
npm run dev
```
Accessible at: `http://localhost:5173`
