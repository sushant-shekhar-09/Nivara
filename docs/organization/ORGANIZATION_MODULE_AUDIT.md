# NIVARA — ORGANIZATION & INSTITUTIONAL MODULE AUDIT
**Date:** November 1, 2026  
**Auditor:** Senior Product & System Architect  
**Scope:** Current Authentication, Role-Based Access Control, Tenancy Infrastructure, and Institutional Workspaces  

---

## 1. Executive Summary

This audit assesses the existing Nivara codebase to determine the reuse potential and architectural gaps for introducing an **Organization Account & Institutional Template Request System** for Universities, Colleges, and Student Support Organizations.

The platform already possesses a sophisticated multi-tenant foundation (`Tenant`, `TenantBranding`, `TenantMembership`, `tenant.py`, and `tenants.py`). However, it currently assumes that tenants are provisioned out-of-band by administrators, lacking a self-service B2B organization registration workflow, account verification lifecycle, formal institutional template request pipeline, and automated idempotent provisioning.

---

## 2. Existing Infrastructure & Reuse Matrix

| Capability / Entity | Existing Implementation | Reuse Strategy & Notes |
|---|---|---|
| **User & Password Security** | `models.User`, `privacy/auth.py` | **100% Reused**. Argon2id hashing, JWT access tokens, and existing user lifecycle are preserved. |
| **RBAC Privileges** | `privacy/rbac.py` (`Role` enum) | **Extended**. Current roles (`platform_admin`, `institution_admin`, `counsellor`, `student`, `admin`) will be extended to include `org_admin`. |
| **Tenant Model** | `models.Tenant`, `models.TenantBranding` | **100% Reused**. Serves as the provisioned workspace target once an organization template request is approved. |
| **Tenant Membership** | `models.TenantMembership` | **100% Reused**. When an organization request is provisioned, the organization administrator is granted `institution_admin` membership in the newly provisioned tenant. |
| **Tenant Boundary Engine** | `nivara/backend/tenant.py` | **100% Reused**. Provides strict slug-based lookups, header extraction (`X-Tenant-Slug`), and `verify_tenant_access`. |
| **Institutional Analytics** | `api/institutional_analytics.py` | **Preserved intact**. Enforces minimum-group size suppression ($k \ge 5$) on student screening metrics. |
| **Admin Dashboard UI** | `frontend/src/pages/AdminPage.tsx` | **Extended**. Currently allows tenant admins to configure their own active tenant branding and campaigns. Will be extended with a Platform Super Admin tab to review pending organization requests and trigger provisioning. |

---

## 3. Identified Architectural Gaps

1. **No Organization Entity or Profile Structure**:
   * Currently, institutions exist only as `Tenant` records.
   * There is no entity representing an unapproved or prospective organization, contact person, designation, address, official email, or verification status.
2. **No Organization Registration or Authentication Flow**:
   * Registration endpoint (`/api/auth/register`) only creates a generic user (defaulting to student).
   * No institutional validation: contact person details, organization type, official domain checking, country/state/city.
3. **No Organization Status Lifecycle**:
   * Need formal transitions: `pending_verification` $\rightarrow$ `active` / `rejected` / `suspended`.
4. **No Institutional Template Request System**:
   * No data model for `OrganizationTemplateRequest` or `OrganizationRequestHistory`.
   * No status tracking: `draft` $\rightarrow$ `submitted` $\rightarrow$ `under_review` $\rightarrow$ `more_info_required` $\rightarrow$ `approved` $\rightarrow$ `rejected` $\rightarrow$ `provisioned`.
   * No duplicate request prevention.
5. **No Idempotent Provisioning Engine**:
   * Currently, tenant onboarding is done via a single standalone endpoint (`POST /api/tenants/onboard`) without request verification or audit history link.
   * A service is required to idempotently convert an approved template request into a configured `Tenant` with branding and admin membership.
6. **No Dedicated Frontend Organization Portal**:
   * Lacks `/org/register`, `/org/login`, and `/org/dashboard` with template request tracking and workspace access.

---

## 4. Target Architecture & Entity Relationship Plan

```
[User] (role: "org_admin")
   │
   ├── (1:N) ──> [OrganizationUser]
   │                    │
   │                    ▼
   │             [Organization] ──(1:1 optional)──> [Tenant] (Provisioned Workspace)
   │                    │                                │
   │                    ├── (1:N)                        ├── [TenantBranding]
   │                    ▼                                ├── [TenantMembership]
   │         [OrganizationTemplateRequest]               ├── [ScreeningCampaign]
   │                    │                                └── [InstitutionalResource]
   │                    └── (1:N) ──> [OrganizationRequestHistory]
```

---

## 5. Security & Privacy Safeguards

1. **Isolation from Student Data**:
   * Organization accounts have **zero access** to individual anonymous student screening records.
   * Screening records remain pseudonymous with cryptographic hashes.
2. **RBAC Boundaries**:
   * Platform administrators alone possess privilege to approve requests and trigger provisioning.
   * Organization administrators can only view and edit their own organization's profile and template requests.
3. **Verification Checks**:
   * Organization registrations are held in `pending_verification` until officially reviewed by a platform admin.
   * Prevents fraudulent institutional domain impersonation.

---

## 6. Conclusion

The existing architecture provides an ideal foundation. By extending `models.py` with `Organization`, `OrganizationUser`, `OrganizationTemplateRequest`, and `OrganizationRequestHistory`, and introducing dedicated backend routes and frontend views, we can deliver the complete B2B2C institutional template request system cleanly without duplicating existing authentication, database, or styling patterns.

