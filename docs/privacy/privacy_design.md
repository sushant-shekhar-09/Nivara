# Privacy & Confidentiality Architecture — StudentMind AI

## 1. Privacy by Design Framework
Mental health data represents the highest tier of sensitive personal data. StudentMind AI implements defense-in-depth privacy engineering:

1. **Argon2id Password Hashing:** All user passwords are encrypted using state-of-the-art Argon2id (`argon2-cffi`), resistant to GPU/ASIC cracking.
2. **Stateless JWT with RBAC:** Role-Based Access Control separates Student, Counsellor, and Administrator roles.
3. **PII Redaction in Logging:** Custom `PIISafeLoggingFilter` redacts emails, passwords, student IDs, and phone numbers before log emission.
4. **Consent Tracking:** Explicit, informed consent is logged with UTC timestamps before any screening data is recorded.
5. **Minimum-Group-Size Suppression:** Population-level analytical queries enforce suppression for small demographic clusters.

---

## 2. Minimum-Group-Size Suppression ($k \ge 5$)
When university administrators or researchers query aggregated mental health prevalence:
- Any institutional, departmental, or demographic group with $N < 5$ respondents is **strictly suppressed** (`[SUPPRESSED: N < 5]`).
- Suppression prevents cell-reidentification attacks where an individual student's responses could be deduced by cross-referencing small demographic subgroups.

> [!NOTE]
> **Governance Disclaimer:** In accordance with methodological standards, this mechanism is accurately designated as **Minimum-Group-Size Suppression**. It is NOT described as formal $k$-anonymity, as it operates on aggregate report suppression rather than full quasi-identifier equivalence class generalization.

---

## 3. Data Minimization & Role Boundaries
- **Students:** Can only access their own screening history and personalized explanations.
- **Counsellors:** Can view anonymized screening trends and flagged appointments with student consent.
- **Administrators:** Can only access aggregated reports subject to minimum-group-size suppression.
