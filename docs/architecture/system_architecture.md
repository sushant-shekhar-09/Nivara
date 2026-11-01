# System Architecture & Technical Design — StudentMind AI

## 1. System Architecture Overview
StudentMind AI employs a clean, layered architectural separation:

```
[ Frontend: React + TypeScript + Vite + Tailwind + Recharts ]
                            │
                      REST / JSON API
                            ▼
[ API Gateway / Routers: FastAPI (CORS, PII Redaction Filter) ]
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
   [ Application Services ]    [ Deterministic Safety Engine ]
   - Auth & RBAC (Argon2id)    - PHQ-9 Item 9 Intercept
   - Screening Coordinator     - Verified Crisis Pathways
   - Aggregate Analytics       - Demo Contact Labels
               │
               ▼
   [ Frozen ML Inference Engine ]
   - Artifact Integrity Check (SHA-256)
   - Zero-Retraining Pipeline
   - Probability Calibration
   - SHAP Attribution Explainer
               │
               ▼
   [ Data Storage: PostgreSQL 16 (SQLAlchemy 2.0 Async / asyncpg) ]
```

---

## 2. Decoupled ML Inference Subsystem
- **Zero-Retraining Principle:** The backend runtime contains zero training logic in the screening execution path.
- **Integrity Validation:** Upon startup, `InferenceEngine` reads `artifacts/depression/metadata.json` and `artifacts/anxiety/metadata.json`, recalculates SHA-256 hashes of the `.joblib` bundles, and halts if a mismatch is detected.
- **Contract Enforcement:** All incoming inputs pass through `nivara.features.contract.audit_and_enforce_leakage`.
