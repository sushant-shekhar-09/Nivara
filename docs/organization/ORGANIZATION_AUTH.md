# Nivara AI — Organization Authentication & Security Specification

## 1. Executive Summary

This document specifies the authentication, authorization, credential management, and session lifecycle for **Institutional Organizations** (universities, colleges, schools, student support organizations, and NGOs) integrating with the Nivara AI platform under its B2B2C operating model.

---

## 2. Security Boundaries & Zero-PII Separation

Nivara maintains a strict boundary between three distinct persona classes:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NIVARA SECURITY TOPOLOGY                        │
├──────────────────────────┬──────────────────────────┬──────────────────┤
│    ANONYMOUS STUDENTS    │  CLINICIANS & COUNSELLORS │   ORGANIZATIONS  │
├──────────────────────────┼──────────────────────────┼──────────────────┤
│ • Zero account / login   │ • Role-governed portal   │ • Org account    │
│ • Ephemeral session UUID │ • Triage & appointment   │ • Template mgmt  │
│ • No student IDs / email │   matching               │ • Cohort views   │
│ • Cryptographic salts    │ • Cannot inspect student │ • ABSOLUTELY NO  │
│                          │   identity unprompted    │   student PII    │
└──────────────────────────┴──────────────────────────┴──────────────────┘
```

> [!IMPORTANT]
> Organization accounts (`org_admin`) have **zero access** to individual student responses, screening timestamps, or personal health information. All institutional visibility is strictly aggregated under mathematical $k \ge 5$ anonymity suppression.

---

## 3. Organization Account Lifecycle

An organization account progresses through deterministic lifecycle states:

```
[Registration Submitted]
           │
           ▼
 [pending_verification] ──(Admin Review / Verification)──► [rejected]
           │
           ▼ (Approved)
       [active] ◄───► [suspended] (Security or compliance lock)
```

| Account Status | Description | Capabilities |
|---|---|---|
| `pending_verification` | Default state upon registration. Domain and institution details are queued for verification. | Can log in, view own profile, submit institutional template requests, and track approval status. |
| `active` | Organization identity verified by platform administration. | Full access to organization dashboard, template requests, and provisioned workspaces. |
| `suspended` | Temporarily or permanently disabled due to policy violation or security hold. | Authentication blocked (`HTTP 403 Forbidden`). |
| `rejected` | Institutional registration failed verification or domain validation. | Authentication blocked (`HTTP 403 Forbidden`). |

---

## 4. Registration Specification

### Endpoint: `POST /api/organizations/register`

### Input Validation Matrix:
- **Organization Name (`name`)**: 2 to 200 characters, trimmed.
- **Organization Type (`org_type`)**: Restricted to `["university", "college", "school", "student_org", "ngo", "other"]`.
- **Official Email (`official_email`)**: Valid RFC 5322 email. The backend automatically extracts and normalizes the apex domain (e.g., `nitk.edu.in` from `dean@nitk.edu.in`).
- **Contact Representative (`contact_person_name`, `contact_person_designation`, `contact_phone`)**: Mandatory authorized representative details.
- **Location (`country`, `state`, `city`)**: Geographic jurisdiction for institutional compliance.
- **Credentials (`password`, `password_confirm`)**: Must match, minimum 8 characters. Hashed using Argon2id (`argon2-cffi`).

### Duplicate Email Prevention:
The system queries both existing `users` and `organizations` for the given official email address. If an account already exists, an `HTTP 400 Bad Request` is returned with an informative error message.

---

## 5. Login & Token Exchange

### Endpoint: `POST /api/organizations/login`

### Authentication Flow:
1. Lookup user in `users` table by case-insensitive normalized email.
2. Verify password hash using constant-time Argon2id comparison (`nivara.privacy.auth.verify_password`).
3. Query `organization_users` and `organizations` tables by `user_id`.
4. Verify organization account status:
   - If `suspended` or `rejected`, deny access with `HTTP 403 Forbidden`.
5. Mint an asymmetric/HMAC JWT access token containing:
   - `sub`: User ID
   - `email`: Official email
   - `role`: `"org_admin"`
   - `org_id`: UUID of the organization
   - `tenant_id`: Associated provisioned tenant UUID (if provisioned)
   - `exp`: Configured token expiration (default: 120 minutes)

### Response Payload:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "org_admin",
  "user_id": "8c4fb2d9-1234-4a56-8b78-c90123456789",
  "org_id": "7a3ec1b8-5678-4c12-9d34-e56789012345",
  "tenant_id": null
}
```

---

## 6. Role-Based Access Control (RBAC)

In `nivara/privacy/rbac.py`:
- `Role.ORG_ADMIN = "org_admin"`
- Protected routes require `require_roles(Role.ORG_ADMIN, Role.ADMIN, Role.PLATFORM_ADMIN)`
- Organization endpoints enforce that `current_user.org_id == requested_resource.org_id`. Cross-organization tampering or inspection returns `HTTP 404 Not Found` or `HTTP 403 Forbidden`.

