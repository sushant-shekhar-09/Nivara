"""
Pydantic Schemas for Request & Response Data Transfer.
Includes Multi-Tenant Institutional Workspaces, Screening Campaigns, and Counselling Triage.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator, model_validator
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    tenant_id: Optional[str] = None
    tenant_slug: Optional[str] = None
    org_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Student Profile Schemas ---
class StudentProfileCreate(BaseModel):
    age: str = Field(..., json_schema_extra={"example": "18-22"})
    gender: str = Field(..., json_schema_extra={"example": "Female"})
    university: str = Field(..., json_schema_extra={"example": "University / Higher Education Institution"})
    department: str = Field(..., json_schema_extra={"example": "Engineering - CS / CSE / CSC / Similar to CS"})
    academic_year: str = Field(..., json_schema_extra={"example": "Second Year or Equivalent"})
    current_cgpa: str = Field(..., json_schema_extra={"example": "2.50 - 2.99"})
    waiver_or_scholarship: str = Field(..., json_schema_extra={"example": "No"})
    consent_given: bool = Field(..., json_schema_extra={"example": True})

class StudentProfileResponse(StudentProfileCreate):
    id: str
    user_id: str
    consent_timestamp: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Screening Submission & Response Schemas ---
class ScreeningSubmission(BaseModel):
    profile: StudentProfileCreate
    phq_responses: List[int] = Field(..., min_length=9, max_length=9, description="9 items (0-3)")
    gad_responses: List[int] = Field(..., min_length=7, max_length=7, description="7 items (0-3)")
    pss_responses: List[int] = Field(..., min_length=10, max_length=10, description="10 items (0-4)")
    tenant_slug: Optional[str] = None
    campaign_id: Optional[str] = None

class MLScreeningOutput(BaseModel):
    calibrated_probability: float
    screening_threshold: float
    elevated_screening_risk: bool
    risk_tier: str
    disclaimer: str

class SafetyOutput(BaseModel):
    safety_concern_identified: bool
    trigger_rule: Optional[str]
    system_statement: str
    crisis_contacts: List[Dict[str, Any]]
    immediate_actions: List[str]

class ScreeningResultResponse(BaseModel):
    session_id: str
    timestamp: datetime
    pss_score: int
    depression: MLScreeningOutput
    anxiety: MLScreeningOutput
    questionnaire_scores: Optional[Dict[str, Any]] = None
    safety: SafetyOutput
    shap_explanation: Optional[Dict[str, Any]]

# --- Voice & Conversational Screening Schemas ---
class ConversationalScreeningStartRequest(BaseModel):
    battery: str = Field(default="phq9", description="One of 'phq9', 'gad7', 'pss10'")
    session_id: Optional[str] = None

class ConversationalScreeningStartResponse(BaseModel):
    session_id: str
    battery: str
    current_index: int
    total_questions: int
    question: Dict[str, Any]
    allowed_options: List[Dict[str, Any]]
    assistant_prompt: str

class ConversationalScreeningAnswerRequest(BaseModel):
    session_id: str
    spoken_or_typed_answer: str
    direct_value: Optional[int] = None

class ConversationalScreeningAnswerResponse(BaseModel):
    session_id: str
    battery: str
    accepted: bool
    confirmed_value: Optional[int] = None
    confirmed_label: Optional[str] = None
    clarification_message: Optional[str] = None
    is_completed: bool = False
    next_index: Optional[int] = None
    next_question: Optional[Dict[str, Any]] = None
    allowed_options: Optional[List[Dict[str, Any]]] = None
    final_result: Optional[Dict[str, Any]] = None
    safety_triggered: bool = False
    safety_output: Optional[SafetyOutput] = None

# --- Multi-Tenant Institutional Schemas (Phase 2) ---

class TenantBrandingResponse(BaseModel):
    id: str
    logo_url: Optional[str] = None
    primary_color: str
    accent_color: str
    portal_title: str
    support_email: Optional[str] = None
    support_phone: Optional[str] = None
    custom_welcome_text: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class TenantBrandingUpdate(BaseModel):
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    accent_color: Optional[str] = None
    portal_title: Optional[str] = None
    support_email: Optional[str] = None
    support_phone: Optional[str] = None
    custom_welcome_text: Optional[str] = None

class TenantResponse(BaseModel):
    id: str
    slug: str
    name: str
    domain: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    branding: Optional[TenantBrandingResponse] = None
    model_config = ConfigDict(from_attributes=True)

class TenantOnboardingRequest(BaseModel):
    name: str = Field(..., min_length=3, description="Full institution name")
    slug: str = Field(..., min_length=2, max_length=50, description="Unique subdomain / slug")
    domain: Optional[str] = None
    description: Optional[str] = None
    admin_email: EmailStr
    admin_password: str = Field(..., min_length=8)
    primary_color: Optional[str] = "#384639"
    accent_color: Optional[str] = "#c85a38"
    portal_title: Optional[str] = None
    support_email: Optional[str] = None

class ScreeningCampaignCreate(BaseModel):
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    supported_instruments: List[str] = Field(default=["phq9", "gad7", "pss10"])
    target_audience: str = "All Students"
    is_published: bool = False

class ScreeningCampaignUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    supported_instruments: Optional[List[str]] = None
    target_audience: Optional[str] = None
    is_published: Optional[bool] = None

class ScreeningCampaignResponse(BaseModel):
    id: str
    tenant_id: str
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    supported_instruments: List[str]
    target_audience: str
    is_published: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class InstitutionalResourceCreate(BaseModel):
    title: str
    category: str = "counselling"
    summary: str
    contact_info: str
    is_emergency: bool = False

class InstitutionalResourceResponse(BaseModel):
    id: str
    tenant_id: str
    title: str
    category: str
    summary: str
    contact_info: str
    is_emergency: bool
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class CounsellingRequestCreate(BaseModel):
    tenant_slug: str
    student_name: str = Field(..., min_length=2)
    student_email: EmailStr
    student_phone: Optional[str] = None
    preferred_contact_method: str = "email"
    urgency_level: str = "standard"  # standard, priority, immediate_support
    notes: Optional[str] = None
    consent_to_contact: bool = True

class CounsellingRequestUpdate(BaseModel):
    status: Optional[str] = None  # pending, assigned, contacted, completed, cancelled
    assigned_counsellor_id: Optional[str] = None
    counsellor_notes: Optional[str] = None

class CounsellingRequestResponse(BaseModel):
    id: str
    tenant_id: str
    student_name: str
    student_email: str
    student_phone: Optional[str] = None
    preferred_contact_method: str
    urgency_level: str
    notes: Optional[str] = None
    consent_to_contact: bool
    status: str
    assigned_counsellor_id: Optional[str] = None
    counsellor_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class InstitutionalAnalyticsOverview(BaseModel):
    tenant_id: str
    tenant_name: str
    total_screenings: int
    suppression_threshold: int
    is_suppressed: bool
    privacy_notice: str
    campaigns_count: int
    counselling_requests_count: int
    category_distribution: Optional[Dict[str, Any]] = None
    recent_activity_trends: Optional[List[Dict[str, Any]]] = None

# ============================================================
# Phase 3: Research Survey & IRB Ethics Schemas
# ============================================================

class SurveyQuestionCreate(BaseModel):
    question_text: str = Field(..., min_length=3)
    question_type: str = "single_choice"  # single_choice, multiple_choice, likert, scale_1_to_5, text
    options: Optional[List[str]] = None
    order_index: int = 0
    is_required: bool = True
    helper_text: Optional[str] = None

class SurveyQuestionResponse(BaseModel):
    id: str
    survey_id: str
    question_text: str
    question_type: str
    options: Optional[List[str]] = None
    order_index: int
    is_required: bool
    helper_text: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ResearchSurveyCreate(BaseModel):
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    purpose: str = Field(..., min_length=10, description="Ethical/scientific purpose statement")
    target_audience: str = "All Enrolled Students"
    ethics_approval_ref: str = Field(..., min_length=3, description="IRB/Ethics protocol number")
    principal_investigator: str = Field(..., min_length=2)
    pi_email: EmailStr
    allow_anonymous: bool = True
    is_published: bool = False
    questions: Optional[List[SurveyQuestionCreate]] = None

class ResearchSurveyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    purpose: Optional[str] = None
    target_audience: Optional[str] = None
    ethics_approval_ref: Optional[str] = None
    principal_investigator: Optional[str] = None
    pi_email: Optional[EmailStr] = None
    is_published: Optional[bool] = None
    allow_anonymous: Optional[bool] = None

class ResearchSurveyResponse(BaseModel):
    id: str
    tenant_id: str
    title: str
    description: Optional[str] = None
    purpose: str
    target_audience: str
    ethics_approval_ref: str
    principal_investigator: str
    pi_email: str
    version: int
    is_published: bool
    allow_anonymous: bool
    created_at: datetime
    updated_at: datetime
    questions: List[SurveyQuestionResponse] = []
    total_responses: int = 0
    model_config = ConfigDict(from_attributes=True)

class ResearchConsentAcceptanceRequest(BaseModel):
    participant_token: Optional[str] = None
    affirmative_consent: bool = True

class ResearchConsentRecordResponse(BaseModel):
    id: str
    survey_id: str
    irb_protocol_number: str
    study_title: str
    participant_token: str
    consent_given: bool
    consented_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SurveyResponseSubmission(BaseModel):
    consent_record_id: str
    participant_token: str
    answers: Dict[str, Any]  # { question_id: answer_val }

class SurveyResponseSubmissionResult(BaseModel):
    response_id: str
    survey_id: str
    submitted_at: datetime
    status: str = "received"
    message: str

class SurveyDeidentifiedExportSummary(BaseModel):
    survey_id: str
    title: str
    irb_approval_ref: str
    exported_at: datetime
    total_records: int
    suppression_applied: bool
    dataset_csv: str

# ============================================================
# Phase 4: Research Consortium Federation Schemas
# ============================================================

class ResearchConsortiumCreate(BaseModel):
    name: str = Field(..., min_length=3)
    master_irb_ref: str = Field(..., min_length=3)
    description: Optional[str] = None
    participating_tenant_slugs: Optional[List[str]] = None

class ResearchConsortiumResponse(BaseModel):
    id: str
    name: str
    master_irb_ref: str
    lead_tenant_id: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    participating_institutions_count: int = 1
    model_config = ConfigDict(from_attributes=True)

# ============================================================
# Phase 5: Organization Account & Institutional Template Schemas
# ============================================================

class OrganizationRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    org_type: str = Field(..., min_length=2, max_length=100)
    official_email: EmailStr
    contact_name: Optional[str] = Field(None, max_length=255)
    contact_person_name: Optional[str] = Field(None, max_length=255)
    contact_designation: Optional[str] = Field(None, max_length=100)
    contact_person_designation: Optional[str] = Field(None, max_length=100)
    contact_phone: str = Field(..., min_length=5, max_length=50)
    country: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    city: str = Field(..., min_length=2, max_length=100)
    website: Optional[str] = None
    description: Optional[str] = None
    password: str = Field(..., min_length=8)
    password_confirm: str = Field(..., min_length=8)

    @model_validator(mode="after")
    def validate_contacts(self):
        if not self.contact_name and not self.contact_person_name:
            raise ValueError("Contact person name is required.")
        if not self.contact_name:
            self.contact_name = self.contact_person_name
        if not self.contact_person_name:
            self.contact_person_name = self.contact_name

        if not self.contact_designation and not self.contact_person_designation:
            raise ValueError("Contact person designation is required.")
        if not self.contact_designation:
            self.contact_designation = self.contact_person_designation
        if not self.contact_person_designation:
            self.contact_person_designation = self.contact_designation

        if self.password != self.password_confirm:
            raise ValueError("Password confirmation does not match password.")
        return self

class OrganizationLoginRequest(BaseModel):
    email: EmailStr
    password: str

class OrganizationResponse(BaseModel):
    id: str
    name: str
    org_type: str
    official_email: str
    contact_name: str
    contact_designation: str
    contact_phone: str
    country: str
    state: str
    city: str
    website: Optional[str] = None
    description: Optional[str] = None
    status: str
    rejection_reason: Optional[str] = None
    verified_at: Optional[datetime] = None
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Optional/Computed compatibility fields for frontend
    slug: Optional[str] = None
    domain: Optional[str] = None
    contact_person_name: Optional[str] = None
    contact_person_designation: Optional[str] = None
    account_status: Optional[str] = None
    is_verified: bool = False

    @model_validator(mode="after")
    def populate_computed_fields(self):
        if not self.slug and self.name:
            import re
            s = re.sub(r"[^\w\s-]", "", self.name).strip().lower()
            self.slug = re.sub(r"[-\s]+", "-", s)[:80]
        if not self.domain and self.official_email and "@" in self.official_email:
            self.domain = self.official_email.split("@")[-1]
        if not self.contact_person_name:
            self.contact_person_name = self.contact_name
        if not self.contact_person_designation:
            self.contact_person_designation = self.contact_designation
        if not self.account_status:
            self.account_status = self.status
        self.is_verified = (self.status == "active")
        return self

    model_config = ConfigDict(from_attributes=True)

class OrganizationProfileUpdate(BaseModel):
    name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_designation: Optional[str] = None
    contact_phone: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None

class OrganizationTemplateRequestCreate(BaseModel):
    intended_use: str = Field(..., min_length=2)
    expected_participants: Optional[int] = Field(None, ge=1)
    estimated_users: Optional[int] = Field(None, ge=1)
    requested_plan: Optional[str] = "standard_institution"
    custom_subdomain: Optional[str] = None
    notes: Optional[str] = None
    additional_requirements: Optional[str] = None
    requested_modules: List[str] = Field(default_factory=list)
    requested_features: Optional[Dict[str, Any]] = None
    desired_branding: Optional[Dict[str, Any]] = None
    authorized_contact_info: Optional[Dict[str, Any]] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Resolve estimated_users <-> expected_participants
            est = data.get("estimated_users")
            exp = data.get("expected_participants")
            if exp is None and est is not None:
                data["expected_participants"] = est
            elif est is None and exp is not None:
                data["estimated_users"] = exp
            elif exp is None and est is None:
                data["expected_participants"] = 100
                data["estimated_users"] = 100

            # Resolve notes <-> additional_requirements
            notes = data.get("notes")
            add_req = data.get("additional_requirements")
            if add_req is None and notes is not None:
                data["additional_requirements"] = notes
            elif notes is None and add_req is not None:
                data["notes"] = add_req

            # Resolve desired_branding
            branding = dict(data.get("desired_branding") or {})
            if "requested_plan" in data and data["requested_plan"] and "requested_plan" not in branding:
                branding["requested_plan"] = data["requested_plan"]
            if "custom_subdomain" in data and data["custom_subdomain"] and "custom_subdomain" not in branding:
                branding["custom_subdomain"] = data["custom_subdomain"]
            if "requested_features" in data and data["requested_features"] and "requested_features" not in branding:
                branding["requested_features"] = data["requested_features"]
            data["desired_branding"] = branding
        return data

class OrganizationTemplateRequestUpdate(BaseModel):
    expected_participants: Optional[int] = None
    estimated_users: Optional[int] = None
    intended_use: Optional[str] = None
    requested_plan: Optional[str] = None
    custom_subdomain: Optional[str] = None
    notes: Optional[str] = None
    additional_requirements: Optional[str] = None
    requested_modules: Optional[List[str]] = None
    requested_features: Optional[Dict[str, Any]] = None
    desired_branding: Optional[Dict[str, Any]] = None
    authorized_contact_info: Optional[Dict[str, Any]] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_update_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            est = data.get("estimated_users")
            exp = data.get("expected_participants")
            if exp is None and est is not None:
                data["expected_participants"] = est
            elif est is None and exp is not None:
                data["estimated_users"] = exp

            notes = data.get("notes")
            add_req = data.get("additional_requirements")
            if add_req is None and notes is not None:
                data["additional_requirements"] = notes
            elif notes is None and add_req is not None:
                data["notes"] = add_req

            branding = dict(data.get("desired_branding") or {}) if data.get("desired_branding") is not None else {}
            if "requested_plan" in data and data["requested_plan"]:
                branding["requested_plan"] = data["requested_plan"]
            if "custom_subdomain" in data and data["custom_subdomain"]:
                branding["custom_subdomain"] = data["custom_subdomain"]
            if "requested_features" in data and data["requested_features"]:
                branding["requested_features"] = data["requested_features"]
            if branding:
                data["desired_branding"] = branding
        return data

class OrganizationRequestHistoryResponse(BaseModel):
    id: str
    request_id: str
    from_status: Optional[str] = None
    to_status: str
    changed_by_user_id: str
    comments: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class OrganizationTemplateRequestResponse(BaseModel):
    id: str
    organization_id: str
    organization_name: Optional[str] = None
    requester_user_id: str
    expected_participants: int
    estimated_users: int = 1000
    intended_use: str
    requested_plan: str = "standard_institution"
    custom_subdomain: Optional[str] = None
    notes: Optional[str] = None
    requested_modules: List[str] = Field(default_factory=list)
    desired_branding: Optional[Dict[str, Any]] = None
    additional_requirements: Optional[str] = None
    authorized_contact_info: Optional[Dict[str, Any]] = None
    status: str
    review_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    decision_reason: Optional[str] = None
    rejection_reason: Optional[str] = None
    reviewed_by_user_id: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    provisioned_tenant_id: Optional[str] = None
    provisioned_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    history: Optional[List[OrganizationRequestHistoryResponse]] = None
    organization: Optional[OrganizationResponse] = None

    @model_validator(mode="before")
    @classmethod
    def populate_computed_fields(cls, data: Any) -> Any:
        if hasattr(data, "__dict__"):
            participants = getattr(data, "expected_participants", 1000) or 1000
            branding = getattr(data, "desired_branding", None) or {}
            if isinstance(branding, str):
                import json
                try:
                    branding = json.loads(branding)
                except Exception:
                    branding = {}
            notes = getattr(data, "additional_requirements", None)
            review_notes = getattr(data, "review_notes", None)
            decision = getattr(data, "decision_reason", None)

            org_val = getattr(data, "organization", None)
            org_res = None
            if org_val is not None:
                try:
                    org_res = OrganizationResponse.model_validate(org_val)
                except Exception:
                    org_res = None

            hist_val = getattr(data, "history", None)
            hist_res = None
            if hist_val is not None:
                try:
                    hist_res = [OrganizationRequestHistoryResponse.model_validate(h) for h in hist_val]
                except Exception:
                    hist_res = None
            
            res = {
                "id": str(data.id),
                "organization_id": str(data.organization_id),
                "organization_name": getattr(data, "organization_name", None) or (org_res.name if org_res else None),
                "requester_user_id": str(data.requester_user_id),
                "expected_participants": participants,
                "estimated_users": participants,
                "intended_use": data.intended_use or "",
                "requested_plan": branding.get("requested_plan", "standard_institution") if isinstance(branding, dict) else "standard_institution",
                "custom_subdomain": branding.get("custom_subdomain") if isinstance(branding, dict) else None,
                "notes": notes,
                "requested_modules": getattr(data, "requested_modules", []) or [],
                "desired_branding": branding if isinstance(branding, dict) else {},
                "additional_requirements": notes,
                "authorized_contact_info": getattr(data, "authorized_contact_info", {}) or {},
                "status": data.status or "submitted",
                "review_notes": review_notes,
                "admin_notes": review_notes,
                "decision_reason": decision,
                "rejection_reason": decision,
                "reviewed_by_user_id": str(data.reviewed_by_user_id) if getattr(data, "reviewed_by_user_id", None) else None,
                "reviewed_at": getattr(data, "reviewed_at", None),
                "provisioned_tenant_id": str(data.provisioned_tenant_id) if getattr(data, "provisioned_tenant_id", None) else None,
                "provisioned_at": getattr(data, "provisioned_at", None),
                "created_at": data.created_at,
                "updated_at": data.updated_at,
                "history": hist_res,
                "organization": org_res,
            }
            return res
        elif isinstance(data, dict):
            participants = data.get("expected_participants") or data.get("estimated_users") or 1000
            data["expected_participants"] = participants
            data["estimated_users"] = participants
            branding = data.get("desired_branding") or {}
            if "requested_plan" not in data or not data["requested_plan"]:
                data["requested_plan"] = branding.get("requested_plan", "standard_institution")
            if "custom_subdomain" not in data or not data["custom_subdomain"]:
                data["custom_subdomain"] = branding.get("custom_subdomain")
            if "notes" not in data or not data["notes"]:
                data["notes"] = data.get("additional_requirements")
            if "additional_requirements" not in data or not data["additional_requirements"]:
                data["additional_requirements"] = data.get("notes")
            if "admin_notes" not in data or not data["admin_notes"]:
                data["admin_notes"] = data.get("review_notes")
            if "rejection_reason" not in data or not data["rejection_reason"]:
                data["rejection_reason"] = data.get("decision_reason")
            if "organization" in data and data["organization"] is not None and not isinstance(data["organization"], (dict, OrganizationResponse)):
                try:
                    data["organization"] = OrganizationResponse.model_validate(data["organization"])
                except Exception:
                    data["organization"] = None
        return data

    model_config = ConfigDict(from_attributes=True)

class OrganizationAdminReviewRequest(BaseModel):
    new_status: str = Field(..., description="under_review, changes_requested, more_info_required, approved, rejected, provisioning, active")
    decision_reason: Optional[str] = None
    review_notes: Optional[str] = None
    internal_notes: Optional[str] = None
    assigned_reviewer_id: Optional[str] = None

class OrganizationAdminAssignReviewerRequest(BaseModel):
    assigned_reviewer_id: Optional[str] = None
    internal_notes: Optional[str] = None

class OrganizationAdminNotesRequest(BaseModel):
    internal_notes: str

class AdminTemplateRequestResponse(OrganizationTemplateRequestResponse):
    internal_notes: Optional[str] = None
    assigned_reviewer_id: Optional[str] = None
    assigned_reviewer_name: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def populate_admin_computed_fields(cls, data: Any) -> Any:
        base_dict = OrganizationTemplateRequestResponse.populate_computed_fields(data)
        if hasattr(data, "__dict__"):
            base_dict["internal_notes"] = getattr(data, "internal_notes", None)
            base_dict["assigned_reviewer_id"] = getattr(data, "assigned_reviewer_id", None)
            reviewer = getattr(data, "assigned_reviewer", None)
            base_dict["assigned_reviewer_name"] = getattr(reviewer, "email", None) if reviewer else None
        elif isinstance(data, dict):
            base_dict["internal_notes"] = data.get("internal_notes")
            base_dict["assigned_reviewer_id"] = data.get("assigned_reviewer_id")
            base_dict["assigned_reviewer_name"] = data.get("assigned_reviewer_name")
        return base_dict

class OrganizationProvisionRequest(BaseModel):
    slug: str = Field(..., min_length=2, max_length=100)
    primary_color: Optional[str] = None
    accent_color: Optional[str] = None
    portal_title: Optional[str] = None
    custom_welcome_text: Optional[str] = None




