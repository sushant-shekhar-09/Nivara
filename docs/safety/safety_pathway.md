# Deterministic Safety Pathway Architecture — StudentMind AI

## 1. Safety Mandate & Ethical Boundary
In higher-education digital mental health applications, automated emergency detection is high-risk and clinically unvalidated. 
StudentMind AI operates under a **Deterministic Safety Boundary**:

> [!CAUTION]
> **Core Principle:** The machine learning model MUST NEVER be responsible for detecting self-harm, assessing emergency status, or diagnosing psychiatric conditions. All safety-relevant evaluations are handled strictly via deterministic, rules-based logic decoupled from ML probability estimates.

---

## 2. Trigger Rule Specification: PHQ-9 Item 9
The Patient Health Questionnaire (PHQ-9) includes a specific inquiry into passive and active suicidal ideation:
- **Item Text:** *"In a semester, how often have you had thoughts that you would be better off dead, or of hurting yourself?"*
- **Response Scale:**
  - $0$ = Not at all
  - $1$ = Several days
  - $2$ = More than half the days
  - $3$ = Nearly every day

### Deterministic Intercept Logic
$$\text{SafetyTrigger} = \begin{cases} \text{TRUE} & \text{if } \text{PHQ-9 Item 9} \ge 1 \\ \text{FALSE} & \text{if } \text{PHQ-9 Item 9} = 0 \end{cases}$$

When $\text{SafetyTrigger} == \text{TRUE}$:
1. **Immediate Modal Intercept:** The interface immediately surfaces a high-priority, empathetic crisis modal.
2. **Standardized Wording:** The system explicitly displays:
   > *"A configured safety rule identified a potential safety concern."*
   > The system **never claims** *"The AI detected suicide risk"* or *"You are in danger."*
3. **Emergency Actions & Contact Presentation:**
   - 24/7 National Emergency Contact: **112** (India)
   - Specialized National Tele-Mental Health Helpline: **Tele-MANAS** (`14416`, `1800-891-4416`)
   - Mental Health Rehabilitation: **KIRAN** (`1800-599-0019`)
   - 24/7 Crisis Intervention: **Vandrevala Foundation** (`+91 9999 666 555`)
   - University Campus Counseling: Clearly marked `DEMO` contact for development.
4. **Audit Logging:** An anonymized event is recorded to `CrisisAuditLog` without logging student identifiable details.

---

## 3. Contact Verification Standards
All helplines and emergency numbers are verified against official public listings:
- **Verified Contacts:** Actual institutional hotlines operating in India.
- **Demo Contacts:** Must bear an explicit `is_demo: true` badge in both JSON API responses and the visual UI.
