"""
SQLAlchemy ORM Models for Nivara AI.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship

from nivara.backend.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student")  # student, counsellor, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("StudentProfile", back_populates="user", uselist=False)

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(String(50), nullable=False)
    gender = Column(String(50), nullable=False)
    university = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    academic_year = Column(String(100), nullable=False)
    current_cgpa = Column(String(50), nullable=False)
    waiver_or_scholarship = Column(String(10), nullable=False)
    consent_given = Column(Boolean, default=False, nullable=False)
    consent_timestamp = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="profile")
    screenings = relationship("ScreeningSession", back_populates="student")

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=True, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    branding = relationship("TenantBranding", back_populates="tenant", uselist=False, cascade="all, delete-orphan")
    memberships = relationship("TenantMembership", back_populates="tenant", cascade="all, delete-orphan")
    campaigns = relationship("ScreeningCampaign", back_populates="tenant", cascade="all, delete-orphan")
    resources = relationship("InstitutionalResource", back_populates="tenant", cascade="all, delete-orphan")
    counselling_requests = relationship("CounsellingRequest", back_populates="tenant", cascade="all, delete-orphan")
    surveys = relationship("ResearchSurvey", back_populates="tenant", cascade="all, delete-orphan")
    screenings = relationship("ScreeningSession", back_populates="tenant")

class TenantBranding(Base):
    __tablename__ = "tenant_brandings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), unique=True, nullable=False)
    logo_url = Column(String(500), nullable=True)
    primary_color = Column(String(50), default="#384639", nullable=False)  # Default deep sage
    accent_color = Column(String(50), default="#c85a38", nullable=False)   # Default terracotta
    portal_title = Column(String(255), default="Student Wellbeing Portal", nullable=False)
    support_email = Column(String(255), nullable=True)
    support_phone = Column(String(100), nullable=True)
    custom_welcome_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="branding")

class TenantMembership(Base):
    __tablename__ = "tenant_memberships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    role = Column(String(50), default="student", nullable=False)  # institution_admin, counsellor, student
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="memberships")
    user = relationship("User")

class ScreeningCampaign(Base):
    __tablename__ = "screening_campaigns"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    supported_instruments = Column(JSON, default=list, nullable=False)  # ["phq9", "gad7", "pss10"]
    target_audience = Column(String(255), default="All Undergraduates", nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="campaigns")
    screenings = relationship("ScreeningSession", back_populates="campaign")

class InstitutionalResource(Base):
    __tablename__ = "institutional_resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="counselling", nullable=False)  # counselling, crisis, academic
    summary = Column(Text, nullable=False)
    contact_info = Column(String(255), nullable=False)
    is_emergency = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="resources")

class CounsellingRequest(Base):
    __tablename__ = "counselling_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), index=True, nullable=False)
    student_name = Column(String(255), nullable=False)
    student_email = Column(String(255), nullable=False)
    student_phone = Column(String(100), nullable=True)
    preferred_contact_method = Column(String(50), default="email", nullable=False)  # email, phone, in_person
    urgency_level = Column(String(50), default="standard", nullable=False)  # standard, priority, immediate_support
    notes = Column(Text, nullable=True)
    consent_to_contact = Column(Boolean, default=True, nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, assigned, contacted, completed, cancelled
    assigned_counsellor_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    counsellor_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="counselling_requests")
    assigned_counsellor = relationship("User")

class ScreeningSession(Base):
    __tablename__ = "screening_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("student_profiles.id"), nullable=False)
    
    # Optional multi-tenant and campaign isolation tagging
    tenant_id = Column(String(36), ForeignKey("tenants.id"), index=True, nullable=True)
    campaign_id = Column(String(36), ForeignKey("screening_campaigns.id"), index=True, nullable=True)

    # Raw item responses stored as JSON arrays
    phq_responses = Column(JSON, nullable=False)
    gad_responses = Column(JSON, nullable=False)
    pss_responses = Column(JSON, nullable=False)
    pss_score = Column(Integer, nullable=False)

    # ML Screening Estimates (from frozen artifacts)
    depression_prob = Column(Float, nullable=False)
    depression_flag = Column(Boolean, nullable=False)
    depression_tier = Column(String(50), nullable=False)

    anxiety_prob = Column(Float, nullable=False)
    anxiety_flag = Column(Boolean, nullable=False)
    anxiety_tier = Column(String(50), nullable=False)

    # Deterministic Safety Pathway Status
    safety_flag = Column(Boolean, default=False, nullable=False)
    safety_rule_triggered = Column(String(100), nullable=True)
    safety_message = Column(Text, nullable=True)

    # Local SHAP Explanation Payload
    shap_summary = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    student = relationship("StudentProfile", back_populates="screenings")
    tenant = relationship("Tenant", back_populates="screenings")
    campaign = relationship("ScreeningCampaign", back_populates="screenings")

class CrisisAuditLog(Base):
    __tablename__ = "crisis_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("screening_sessions.id"), nullable=False)
    safety_rule_triggered = Column(String(100), nullable=False)
    action_taken = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# ============================================================
# Phase 3: Research Survey Engine & IRB Governance Models
# ============================================================

class ResearchSurvey(Base):
    __tablename__ = "research_surveys"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    purpose = Column(Text, nullable=False)
    target_audience = Column(String(255), default="All Enrolled Students", nullable=False)
    ethics_approval_ref = Column(String(100), nullable=False)  # e.g., IRB-2026-DU-042
    principal_investigator = Column(String(255), nullable=False)
    pi_email = Column(String(255), nullable=False)
    version = Column(Integer, default=1, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    allow_anonymous = Column(Boolean, default=True, nullable=False)
    consortium_id = Column(String(36), ForeignKey("research_consortia.id"), index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="surveys")
    consortium = relationship("ResearchConsortium", back_populates="surveys")
    questions = relationship("SurveyQuestion", back_populates="survey", cascade="all, delete-orphan", order_by="SurveyQuestion.order_index")
    consent_records = relationship("ResearchConsentRecord", back_populates="survey", cascade="all, delete-orphan")
    responses = relationship("SurveyResponse", back_populates="survey", cascade="all, delete-orphan")

class SurveyQuestion(Base):
    __tablename__ = "survey_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    survey_id = Column(String(36), ForeignKey("research_surveys.id"), index=True, nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False)  # single_choice, multiple_choice, likert, scale_1_to_5, text
    options = Column(JSON, nullable=True)  # List of choices or scale definitions
    order_index = Column(Integer, default=0, nullable=False)
    is_required = Column(Boolean, default=True, nullable=False)
    helper_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    survey = relationship("ResearchSurvey", back_populates="questions")

class ResearchConsentRecord(Base):
    __tablename__ = "research_consent_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), index=True, nullable=False)
    survey_id = Column(String(36), ForeignKey("research_surveys.id"), index=True, nullable=False)
    irb_protocol_number = Column(String(100), nullable=False)
    study_title = Column(String(255), nullable=False)
    versioned_consent_text = Column(Text, nullable=False)
    participant_token = Column(String(100), index=True, nullable=False)  # Cryptographic pseudonym
    consent_given = Column(Boolean, default=True, nullable=False)
    consented_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    withdrawal_requested = Column(Boolean, default=False, nullable=False)

    tenant = relationship("Tenant")
    survey = relationship("ResearchSurvey", back_populates="consent_records")
    responses = relationship("SurveyResponse", back_populates="consent_record")

class SurveyResponse(Base):
    __tablename__ = "survey_responses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    survey_id = Column(String(36), ForeignKey("research_surveys.id"), index=True, nullable=False)
    consent_record_id = Column(String(36), ForeignKey("research_consent_records.id"), index=True, nullable=False)
    respondent_token = Column(String(100), index=True, nullable=False)
    answers = Column(JSON, nullable=False)  # { question_id: answer_val }
    submitted_at = Column(DateTime, default=datetime.utcnow, index=True)

    survey = relationship("ResearchSurvey", back_populates="responses")
    consent_record = relationship("ResearchConsentRecord", back_populates="responses")

# ============================================================
# Phase 4: Multi-Center Research Consortium Federation Models
# ============================================================

class ResearchConsortium(Base):
    __tablename__ = "research_consortia"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    master_irb_ref = Column(String(100), nullable=False)  # e.g., IRB-FED-2026-MULTI-09
    lead_tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    lead_tenant = relationship("Tenant")
    memberships = relationship("ConsortiumMembership", back_populates="consortium", cascade="all, delete-orphan")
    surveys = relationship("ResearchSurvey", back_populates="consortium")

class ConsortiumMembership(Base):
    __tablename__ = "consortium_memberships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    consortium_id = Column(String(36), ForeignKey("research_consortia.id"), index=True, nullable=False)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), index=True, nullable=False)
    local_ethics_ref = Column(String(100), nullable=False)  # Institutional IRB ratification
    is_active = Column(Boolean, default=True, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)

    consortium = relationship("ResearchConsortium", back_populates="memberships")
    tenant = relationship("Tenant")

# ============================================================
# Phase 5: Organization Account & Institutional Template System
# ============================================================

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    org_type = Column(String(100), nullable=False)  # university, college, school, student_support, healthcare, other
    official_email = Column(String(255), unique=True, index=True, nullable=False)
    contact_name = Column(String(255), nullable=False)
    contact_designation = Column(String(100), nullable=False)
    contact_phone = Column(String(50), nullable=False)
    country = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    website = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    
    # Account status: pending_verification, active, suspended, rejected
    status = Column(String(50), default="pending_verification", nullable=False)
    rejection_reason = Column(Text, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    # Optional provisioned tenant workspace linkage
    tenant_id = Column(String(36), ForeignKey("tenants.id"), unique=True, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = relationship("OrganizationUser", back_populates="organization", cascade="all, delete-orphan")
    template_requests = relationship("OrganizationTemplateRequest", back_populates="organization", cascade="all, delete-orphan")
    tenant = relationship("Tenant", foreign_keys=[tenant_id])


class OrganizationUser(Base):
    __tablename__ = "organization_users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    role = Column(String(50), default="org_admin", nullable=False)  # org_admin, org_member
    is_primary_contact = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="members")
    user = relationship("User")


class OrganizationTemplateRequest(Base):
    __tablename__ = "organization_template_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), index=True, nullable=False)
    requester_user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    
    expected_participants = Column(Integer, nullable=False)
    intended_use = Column(Text, nullable=False)
    requested_modules = Column(JSON, default=list, nullable=False)
    desired_branding = Column(JSON, nullable=True)
    additional_requirements = Column(Text, nullable=True)
    authorized_contact_info = Column(JSON, nullable=False)
    
    # Request status: draft, submitted, under_review, more_info_required, approved, rejected, provisioned
    status = Column(String(50), default="submitted", nullable=False)
    review_notes = Column(Text, nullable=True)
    decision_reason = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)  # STRICTLY internal to Nivara Platform Admins - never exposed to institutions
    
    assigned_reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    provisioned_tenant_id = Column(String(36), ForeignKey("tenants.id"), index=True, nullable=True)
    provisioned_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="template_requests")
    requester = relationship("User", foreign_keys=[requester_user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by_user_id])
    assigned_reviewer = relationship("User", foreign_keys=[assigned_reviewer_id])
    provisioned_tenant = relationship("Tenant", foreign_keys=[provisioned_tenant_id])
    history = relationship(
        "OrganizationRequestHistory",
        back_populates="request",
        cascade="all, delete-orphan",
        order_by="OrganizationRequestHistory.created_at.desc()"
    )


class OrganizationRequestHistory(Base):
    __tablename__ = "organization_request_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    request_id = Column(String(36), ForeignKey("organization_template_requests.id"), index=True, nullable=False)
    from_status = Column(String(50), nullable=True)
    to_status = Column(String(50), nullable=False)
    changed_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("OrganizationTemplateRequest", back_populates="history")
    changed_by = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=True)
    organization_id = Column(String(36), ForeignKey("organizations.id"), index=True, nullable=True)
    recipient_role = Column(String(50), nullable=True)  # 'platform_admin' or None
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info", nullable=False)  # 'info', 'success', 'warning', 'error'
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", foreign_keys=[user_id])
    organization = relationship("Organization", foreign_keys=[organization_id])




