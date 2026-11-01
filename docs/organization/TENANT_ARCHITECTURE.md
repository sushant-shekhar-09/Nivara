# Nivara AI — Multi-Tenant Architecture & Data Isolation

## 1. Multi-Tenant Philosophy: Strict Cryptographic Isolation

Nivara uses a **Logical Multi-Tenancy with Row-Level Isolation** architecture. Multiple universities and organizations share unified compute and ML inference models, but all stored records, screening campaigns, aggregate cohort analytics, and staff access are strictly segregated by `tenant_id`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NIVARA SHARED PLATFORM                          │
│                                                                        │
│  [XGBoost / LightGBM Screening Pipeline]   [TreeSHAP Attribution Core] │
│  [Deterministic Crisis Rules Engine]       [Voice STT/TTS Pipeline]    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     TENANT A (e.g. NITK)        │   │     TENANT B (e.g. BITS)        │
├─────────────────────────────────┤   ├─────────────────────────────────┤
│ • Tenant Branding: Forest/Lime  │   │ • Tenant Branding: Deep Blue    │
│ • Custom Helpline: 080-2474747  │   │ • Custom Helpline: 01596-242211 │
│ • Campaigns: Freshers Check-in  │   │ • Campaigns: Mid-term Wellness  │
│ • Staff: NITK Counsellors Only  │   │ • Staff: BITS Counsellors Only  │
│ • Sessions: tenant_id = 'A'     │   │ • Sessions: tenant_id = 'B'     │
│ • Isolation: CANNOT view B      │   │ • Isolation: CANNOT view A      │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 2. Multi-Tenant Isolation Matrix

| Layer | Enforcement Mechanism | Failure Defense |
|---|---|---|
| **Student Screening** | Tagged with `tenant_slug` query param (`/screening?tenant=nitk`). Stored with `tenant_id`. | If no tenant is provided, defaults to public anonymous screening with zero campus association. |
| **Counsellor Triage** | JWT token contains `tenant_id`. SQL queries explicitly filter `WHERE tenant_id = :user_tenant_id`. | Counsellors from Institution A cannot query, update, or triage students from Institution B (`HTTP 403 / 404`). |
| **Screening Campaigns** | Scoped to `tenant_id`. Students can only submit responses under active campaigns belonging to that specific tenant. | Campaign queries explicitly validate tenant ownership. |
| **Cohort Analytics** | Aggregate queries filter `WHERE tenant_id = :tenant_id`. Cell suppression enforces $k \ge 5$ minimum cohort sizes. | Cells with fewer than 5 respondents return `"[REDACTED_CELL_K_LT_5]"` to prevent demographic de-anonymization. |
| **Organization Accounts** | Scoped to `organization_id`. Template requests are foreign-keyed to `organizations.id`. | Organization A cannot read or mutate Organization B's template requests or profile. |
| **IRB Research Surveys** | Separate `research_surveys` table linked to `tenant_id`. Optional federated sharing governed by IRB consortium protocol IDs. | Raw text and identifying columns are stripped during export; differential privacy noise is applied. |

---

## 3. Database Schema Entity Relationship

```
organizations (id, name, slug, org_type, official_email, account_status)
    │
    ├──< organization_users (user_id, organization_id, role)
    │
    └──< organization_template_requests (id, organization_id, status, requested_plan, custom_subdomain)
             │
             ├──< organization_request_history (id, request_id, previous_status, new_status, reason_or_notes)
             │
             └──(Provisioning)──► tenants (id, name, slug, domain, is_active)
                                      │
                                      ├──< tenant_branding (tenant_id, primary_color, accent_color, portal_title)
                                      ├──< tenant_memberships (tenant_id, user_id, role)
                                      ├──< screening_campaigns (tenant_id, title, is_published)
                                      ├──< institutional_resources (tenant_id, resource_name, contact_phone)
                                      └──< screening_sessions (id, tenant_id, campaign_id, risk_tier)
```

---

## 4. Student Privacy Guarantees

1. **No Student Accounts**: Students never create institutional accounts. They access the portal anonymously through campus links or campaign QR codes.
2. **Hash-Chain Decoupling**: Screening responses are dissociated from IP addresses, MAC addresses, and student roll numbers.
3. **No Direct Institution Access to Raw Responses**: Institutional administrators can only access aggregate demographic metrics and risk band distributions; individual item responses (PHQ-9/GAD-7) are mathematically inaccessible to institution admins.
4. **Deterministic Safety Sanctuary**: If an anonymous student indicates critical crisis signals (e.g. PHQ-9 item 9 suicidal ideation > 0), the system immediately presents direct national and campus crisis emergency contacts, offering immediate voluntary self-referral without automated student surveillance.

