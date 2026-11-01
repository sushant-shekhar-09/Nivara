/**
 * Typed API client layer for Nivara AI backend.
 * Base URL: http://localhost:8000/api
 * 
 * Handles:
 * - Auth header injection from localStorage JWT
 * - Typed request/response with generics
 * - Loading, error, and empty states
 * - No PII in console logs
 */

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:8000/api';

interface ApiError {
  status: number;
  message: string;
  detail?: string;
}

class ApiClientError extends Error {
  status: number;
  detail?: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = error.status;
    this.detail = error.detail;
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('nivara_token') || localStorage.getItem('studentmind_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail: string | undefined;
    try {
      const errorBody = await response.json();
      if (typeof errorBody.detail === 'string') {
        detail = errorBody.detail;
      } else if (Array.isArray(errorBody.detail)) {
        // FastAPI validation errors: [{"loc": ["body", "field"], "msg": "Field required"}]
        detail = errorBody.detail
          .map((item: any) => {
            if (typeof item === 'string') return item;
            if (item?.msg) {
              const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : '';
              return field ? `${field}: ${item.msg}` : item.msg;
            }
            return JSON.stringify(item);
          })
          .join(', ');
      } else if (errorBody.detail && typeof errorBody.detail === 'object') {
        detail = errorBody.detail.message || errorBody.detail.msg || JSON.stringify(errorBody.detail);
      } else if (errorBody.message) {
        detail = errorBody.message;
      }
    } catch {
      // Response body wasn't JSON
    }

    throw new ApiClientError({
      status: response.status,
      message: `API request failed (${response.status})`,
      detail: detail || `Request failed with status ${response.status}`,
    });
  }

  return response.json() as Promise<T>;
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  return handleResponse<T>(response);
}

async function apiPost<T, B>(path: string, body: B): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

async function apiPut<T, B>(path: string, body: B): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

// ============================================================
// Auth endpoints
// ============================================================

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  role?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: string;
  tenant_id?: string;
  tenant_slug?: string;
  org_id?: string;
}

interface UserResponse {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export async function loginUser(data: LoginRequest): Promise<TokenResponse> {
  return apiPost<TokenResponse, LoginRequest>('/auth/login', data);
}

export async function registerUser(data: RegisterRequest): Promise<UserResponse> {
  return apiPost<UserResponse, RegisterRequest>('/auth/register', data);
}

// ============================================================
// Screening endpoints
// ============================================================

import type { StudentProfileData, ScreeningResult } from '../types';

interface ScreeningSubmission {
  profile: StudentProfileData;
  phq_responses: number[];
  gad_responses: number[];
  pss_responses: number[];
}

export async function submitScreening(data: ScreeningSubmission): Promise<ScreeningResult> {
  return apiPost<ScreeningResult, ScreeningSubmission>('/screening/submit', data);
}

// ============================================================
// Safety endpoints
// ============================================================

interface CrisisResourcesResponse {
  verified_helplines: Array<{
    name: string;
    contact_type: string;
    phone_or_url: string;
    operating_hours: string;
    is_demo: boolean;
    description: string;
  }>;
  demo_contacts: Array<{
    name: string;
    contact_type: string;
    phone_or_url: string;
    operating_hours: string;
    is_demo: boolean;
    description: string;
  }>;
  guidance: string;
}

export async function getCrisisResources(): Promise<CrisisResourcesResponse> {
  return apiGet<CrisisResourcesResponse>('/safety/resources');
}

// ============================================================
// Analytics endpoints
// ============================================================

interface UniversityAnalyticsItem {
  university: string;
  sample_size: number;
  depression_rate: number | null;
  anxiety_rate: number | null;
  suppressed: boolean;
}

export async function getUniversityAnalytics(): Promise<UniversityAnalyticsItem[]> {
  return apiGet<UniversityAnalyticsItem[]>('/analytics/universities');
}

// ============================================================
// Health check
// ============================================================

interface HealthResponse {
  status: string;
  service: string;
  version: string;
  ml_inference: string;
  safety_pathway: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/health');
}

// ============================================================
// Voice Screening & Speech Validation endpoints (Zero LLM)
// ============================================================

export interface ConversationalScreeningStartResult {
  session_id: string;
  battery: string;
  current_index: number;
  total_questions: number;
  question: { id: number; text: string; safety_critical?: boolean; reversed?: boolean };
  allowed_options: Array<{ value: number; label: string }>;
  assistant_prompt: string;
}

export interface ConversationalScreeningAnswerResult {
  session_id: string;
  battery: string;
  accepted: boolean;
  confirmed_value?: number;
  confirmed_label?: string;
  clarification_message?: string;
  is_completed: boolean;
  next_index?: number;
  next_question?: { id: number; text: string; safety_critical?: boolean; reversed?: boolean };
  allowed_options?: Array<{ value: number; label: string }>;
  final_result?: {
    instrument: string;
    total_score: number;
    severity_tier: string;
    elevated_screening_risk?: boolean;
    safety_concern_identified?: boolean;
    disclaimer: string;
  };
  safety_triggered: boolean;
  safety_output?: any;
}

export interface SpeechValidationResult {
  valid: boolean;
  value?: number;
  label?: string;
  confidence: number;
  needs_confirmation: boolean;
  clarification_prompt?: string;
}

export interface VoicePipelineStatusResult {
  status: string;
  tts_engine: string;
  stt_engine: string;
  llm_dependency: string;
  deterministic_safety: string;
}

export async function startConversationalScreening(battery: string = 'phq9', sessionId?: string): Promise<ConversationalScreeningStartResult> {
  return apiPost<ConversationalScreeningStartResult, { battery: string; session_id?: string }>('/chat/screening/start', {
    battery,
    session_id: sessionId,
  });
}

export async function answerConversationalScreening(
  answerText: string,
  sessionId: string,
  directValue?: number
): Promise<ConversationalScreeningAnswerResult> {
  return apiPost<ConversationalScreeningAnswerResult, { spoken_or_typed_answer: string; session_id: string; direct_value?: number }>(
    '/chat/screening/answer',
    {
      spoken_or_typed_answer: answerText,
      session_id: sessionId,
      direct_value: directValue,
    }
  );
}

export async function validateSpeechAnswer(instrument: string, spokenText: string): Promise<SpeechValidationResult> {
  return apiPost<SpeechValidationResult, { instrument: string; spoken_text: string }>('/chat/screening/validate-speech', {
    instrument,
    spoken_text: spokenText,
  });
}

export async function fetchWellbeingResources(query?: string): Promise<Array<any>> {
  const q = query ? `?query=${encodeURIComponent(query)}` : '';
  return apiGet<Array<any>>(`/chat/resources${q}`);
}

export async function fetchVoicePipelineStatus(): Promise<VoicePipelineStatusResult> {
  return apiGet<VoicePipelineStatusResult>('/chat/voice/status');
}

// ============================================================
// Phase 2: Multi-Tenant Institutional Workspaces & SaaS Layer
// ============================================================

export interface TenantBrandingData {
  logo_url?: string | null;
  primary_color: string;
  accent_color: string;
  portal_title: string;
  support_email?: string | null;
  support_phone?: string | null;
  custom_welcome_text?: string | null;
}

export interface TenantPublicConfig {
  tenant_id: string;
  slug: string;
  name: string;
  domain?: string | null;
  description?: string | null;
  branding: TenantBrandingData | null;
  campaigns: Array<{
    id: string;
    title: string;
    description?: string;
    supported_instruments: string[];
    target_audience: string;
  }>;
  resources: Array<{
    id: string;
    title: string;
    category: string;
    summary: string;
    contact_info: string;
    is_emergency: boolean;
  }>;
}

export interface ScreeningCampaignItem {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  supported_instruments: string[];
  target_audience: string;
  is_published: boolean;
  created_at: string;
}

export interface CounsellingCaseItem {
  id: string;
  tenant_id: string;
  student_name: string;
  student_email: string;
  student_phone?: string | null;
  preferred_contact_method: string;
  urgency_level: 'standard' | 'priority' | 'immediate_support';
  notes?: string | null;
  consent_to_contact: boolean;
  status: 'pending' | 'assigned' | 'contacted' | 'completed' | 'cancelled';
  assigned_counsellor_id?: string | null;
  counsellor_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstitutionalAnalyticsData {
  tenant_id: string;
  tenant_name: string;
  total_screenings: number;
  suppression_threshold: number;
  is_suppressed: boolean;
  privacy_notice: string;
  campaigns_count: number;
  counselling_requests_count: number;
  category_distribution?: {
    elevated_depression_rate_pct: number;
    elevated_anxiety_rate_pct: number;
    average_pss_stress_score: number;
    depression_tier_breakdown: Record<string, number>;
    anxiety_tier_breakdown: Record<string, number>;
  } | null;
}

export interface TenantStaffMember {
  membership_id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

export async function fetchTenantPublicConfig(slug: string): Promise<TenantPublicConfig> {
  return apiGet<TenantPublicConfig>(`/tenants/${slug}/config`);
}

export async function updateTenantBranding(slug: string, branding: Partial<TenantBrandingData>): Promise<TenantBrandingData> {
  return apiPut<TenantBrandingData, Partial<TenantBrandingData>>(`/tenants/${slug}/branding`, branding);
}

export async function fetchTenantCampaigns(slug: string, adminAll: boolean = false): Promise<ScreeningCampaignItem[]> {
  const path = adminAll ? `/tenants/${slug}/campaigns/all` : `/tenants/${slug}/campaigns`;
  return apiGet<ScreeningCampaignItem[]>(path);
}

export async function createTenantCampaign(
  slug: string,
  campaign: {
    title: string;
    description?: string;
    supported_instruments?: string[];
    target_audience?: string;
    is_published?: boolean;
  }
): Promise<ScreeningCampaignItem> {
  return apiPost<ScreeningCampaignItem, typeof campaign>(`/tenants/${slug}/campaigns`, campaign);
}

export async function updateTenantCampaign(
  slug: string,
  campaignId: string,
  campaign: Partial<{
    title: string;
    description: string;
    supported_instruments: string[];
    target_audience: string;
    is_published: boolean;
  }>
): Promise<ScreeningCampaignItem> {
  return apiPut<ScreeningCampaignItem, typeof campaign>(`/tenants/${slug}/campaigns/${campaignId}`, campaign);
}

export async function submitCounsellingRequest(req: {
  tenant_slug: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  preferred_contact_method?: string;
  urgency_level?: string;
  notes?: string;
  consent_to_contact: boolean;
}): Promise<CounsellingCaseItem> {
  return apiPost<CounsellingCaseItem, typeof req>('/counselling/request', req);
}

export async function fetchCounsellingCases(slug: string, statusFilter?: string): Promise<CounsellingCaseItem[]> {
  const q = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : '';
  return apiGet<CounsellingCaseItem[]>(`/counselling/cases/${slug}${q}`);
}

export async function updateCounsellingCase(
  slug: string,
  requestId: string,
  update: {
    status?: string;
    assigned_counsellor_id?: string;
    counsellor_notes?: string;
  }
): Promise<CounsellingCaseItem> {
  return apiPut<CounsellingCaseItem, typeof update>(`/counselling/cases/${slug}/${requestId}`, update);
}

export async function fetchInstitutionalAnalytics(slug: string): Promise<InstitutionalAnalyticsData> {
  return apiGet<InstitutionalAnalyticsData>(`/tenants/${slug}/analytics/overview`);
}

export async function fetchTenantStaff(slug: string): Promise<TenantStaffMember[]> {
  return apiGet<TenantStaffMember[]>(`/tenants/${slug}/staff`);
}

export async function addTenantStaff(slug: string, staff: { email: string; password: string; role?: string }): Promise<any> {
  return apiPost<any, typeof staff>(`/tenants/${slug}/staff`, staff);
}

// ============================================================
// Phase 3: Research Survey Engine & IRB Governance
// ============================================================

export interface SurveyQuestionItem {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'likert' | 'scale_1_to_5' | 'text';
  options?: string[] | null;
  order_index: number;
  is_required: boolean;
  helper_text?: string | null;
}

export interface ResearchSurveyItem {
  id: string;
  tenant_id: string;
  title: string;
  description?: string | null;
  purpose: string;
  target_audience: string;
  ethics_approval_ref: string;
  principal_investigator: string;
  pi_email: string;
  version: number;
  is_published: boolean;
  allow_anonymous: boolean;
  created_at: string;
  updated_at: string;
  questions: SurveyQuestionItem[];
  total_responses: number;
}

export interface ResearchConsentRecord {
  id: string;
  survey_id: string;
  irb_protocol_number: string;
  study_title: string;
  participant_token: string;
  consent_given: boolean;
  consented_at: string;
}

export interface SurveySubmissionResult {
  response_id: string;
  survey_id: string;
  submitted_at: string;
  status: string;
  message: string;
}

export async function fetchTenantSurveys(slug: string, adminAll: boolean = false): Promise<ResearchSurveyItem[]> {
  const path = adminAll ? `/surveys/${slug}?all_surveys=true` : `/surveys/${slug}`;
  return apiGet<ResearchSurveyItem[]>(path);
}

export async function fetchSurveyDetail(slug: string, surveyId: string): Promise<ResearchSurveyItem> {
  return apiGet<ResearchSurveyItem>(`/surveys/${slug}/${surveyId}`);
}

export async function createResearchSurvey(
  slug: string,
  survey: {
    title: string;
    description?: string;
    purpose: string;
    target_audience?: string;
    ethics_approval_ref: string;
    principal_investigator: string;
    pi_email: string;
    allow_anonymous?: boolean;
    is_published?: boolean;
    questions?: Array<{
      question_text: string;
      question_type: string;
      options?: string[];
      order_index?: number;
      is_required?: boolean;
      helper_text?: string;
    }>;
  }
): Promise<ResearchSurveyItem> {
  return apiPost<ResearchSurveyItem, typeof survey>(`/surveys/${slug}`, survey);
}

export async function updateResearchSurvey(
  slug: string,
  surveyId: string,
  update: Partial<{
    title: string;
    description: string;
    purpose: string;
    target_audience: string;
    ethics_approval_ref: string;
    principal_investigator: string;
    pi_email: string;
    is_published: boolean;
  }>
): Promise<ResearchSurveyItem> {
  return apiPut<ResearchSurveyItem, typeof update>(`/surveys/${slug}/${surveyId}`, update);
}

export async function recordResearchConsent(
  slug: string,
  surveyId: string,
  affirmativeConsent: boolean = true
): Promise<ResearchConsentRecord> {
  return apiPost<ResearchConsentRecord, { affirmative_consent: boolean }>(
    `/surveys/${slug}/${surveyId}/consent`,
    { affirmative_consent: affirmativeConsent }
  );
}

export async function submitSurveyResponses(
  slug: string,
  surveyId: string,
  payload: {
    consent_record_id: string;
    participant_token: string;
    answers: Record<string, any>;
  }
): Promise<SurveySubmissionResult> {
  return apiPost<SurveySubmissionResult, typeof payload>(`/surveys/${slug}/${surveyId}/respond`, payload);
}

export async function exportSurveyDataCsv(slug: string, surveyId: string): Promise<string> {
  const response = await fetch(`${API_BASE}/surveys/${slug}/${surveyId}/export`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    throw new ApiClientError({
      status: response.status,
      message: `Failed to export survey data (${response.status})`,
    });
  }
  return response.text();
}

// ============================================================
// Phase 4: Psychoeducation, Wellbeing Ecosystem & Fairness Audit
// ============================================================

export interface PsychoeducationResource {
  id: string;
  title: string;
  category: 'crisis' | 'breathing' | 'grounding' | 'sleep' | 'academic_stress' | 'counselling';
  summary: string;
  details: string;
  steps?: string[];
  contact_info?: string;
  source_attribution: string;
}

export interface PsychoeducationResponse {
  total: number;
  category_filter?: string | null;
  resources: PsychoeducationResource[];
}

export async function getPsychoeducationResources(
  category?: string,
  query?: string
): Promise<PsychoeducationResponse> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (query) params.append('query', query);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiGet<PsychoeducationResponse>(`/safety/psychoeducation${qs}`);
}

export interface FairnessSubgroupMetrics {
  count: number;
  selection_rate: number;
  base_rate: number;
  tpr: number;
  fpr: number;
  accuracy: number;
  f1: number;
}

export interface FairnessRatio {
  demographic_parity_ratio?: number;
  demographic_parity_diff?: number;
  equal_opportunity_tpr_ratio?: number;
  passes_four_fifths_rule: boolean;
}

export interface TaskFairnessAudit {
  overall_performance: FairnessSubgroupMetrics;
  subgroups: {
    gender?: Record<string, FairnessSubgroupMetrics>;
    financial_aid?: Record<string, FairnessSubgroupMetrics>;
    academic_year?: Record<string, FairnessSubgroupMetrics>;
  };
  fairness_ratios: Record<string, FairnessRatio>;
  four_fifths_compliance: boolean;
}

export interface ModelFairnessAuditResponse {
  provenance: {
    benchmark_dataset: string;
    doi: string;
    total_cohort_evaluated: number;
    feature_count: number;
    leakage_status: string;
  };
  tasks: {
    depression: TaskFairnessAudit;
    anxiety: TaskFairnessAudit;
  };
  ethics_statement: string;
}

export async function getModelFairnessAudit(): Promise<ModelFairnessAuditResponse> {
  return apiGet<ModelFairnessAuditResponse>('/analytics/fairness-audit');
}

export async function registerConsortium(payload: {
  name: string;
  slug: string;
  lead_institution: string;
  irb_protocol_id: string;
  description?: string;
}): Promise<any> {
  return apiPost<any, typeof payload>('/surveys/consortium/register', payload);
}

export async function exportConsortiumFederatedDataCsv(consortiumId: string): Promise<string> {
  const response = await fetch(`${API_BASE}/surveys/consortium/${consortiumId}/federated-export`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    throw new ApiClientError({
      status: response.status,
      message: `Failed to export federated consortium data (${response.status})`,
    });
  }
  return response.text();
}

// Re-export error class for consumers
export { ApiClientError };
export type { TokenResponse, UserResponse, CrisisResourcesResponse, UniversityAnalyticsItem, HealthResponse };

// ============================================================
// Organization & Institutional Template Request Endpoints
// ============================================================

export interface OrganizationRegisterRequest {
  name: string;
  org_type: string;
  official_email: string;
  contact_name?: string;
  contact_person_name?: string;
  contact_designation?: string;
  contact_person_designation?: string;
  contact_phone: string;
  country: string;
  state: string;
  city: string;
  website?: string;
  description?: string;
  password: string;
  password_confirm: string;
}

export interface OrganizationLoginRequest {
  email: string;
  password: string;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  org_type: string;
  official_email: string;
  domain: string;
  contact_person_name: string;
  contact_name?: string;
  contact_person_designation: string;
  contact_phone: string;
  country: string;
  state: string;
  city: string;
  website?: string | null;
  description?: string | null;
  account_status?: 'pending_verification' | 'active' | 'suspended' | 'rejected';
  status?: 'pending_verification' | 'active' | 'suspended' | 'rejected' | string;
  is_verified: boolean;
  tenant_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationProfileUpdate {
  contact_person_name?: string;
  contact_person_designation?: string;
  contact_phone?: string;
  website?: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface OrganizationTemplateRequestCreate {
  intended_use: string;
  requested_plan: string;
  estimated_users: number;
  custom_subdomain?: string;
  requested_features?: Record<string, any>;
  notes?: string;
}

export interface OrganizationTemplateRequestUpdate {
  intended_use?: string;
  requested_plan?: string;
  estimated_users?: number;
  custom_subdomain?: string;
  requested_features?: Record<string, any>;
  notes?: string;
}

export interface OrganizationRequestHistoryResponse {
  id: string;
  request_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by_user_id: string | null;
  reason_or_notes: string | null;
  created_at: string;
}

export interface OrganizationTemplateRequestResponse {
  id: string;
  organization_id: string;
  organization_name?: string;
  status: 'draft' | 'submitted' | 'pending_review' | 'under_review' | 'more_info_required' | 'changes_requested' | 'approved' | 'rejected' | 'provisioning' | 'active' | 'provisioned';
  intended_use: string;
  requested_plan: string;
  estimated_users: number;
  expected_participants?: number;
  custom_subdomain?: string | null;
  requested_features?: Record<string, any> | null;
  notes?: string | null;
  admin_notes?: string | null;
  additional_requirements?: string | null;
  rejection_reason?: string | null;
  decision_reason?: string | null;
  provisioned_tenant_id?: string | null;
  provisioned_at?: string | null;
  created_at: string;
  updated_at: string;
  history?: OrganizationRequestHistoryResponse[];
  organization?: OrganizationResponse;
}

export interface AdminTemplateRequestResponse extends OrganizationTemplateRequestResponse {
  internal_notes?: string | null;
  assigned_reviewer_id?: string | null;
  assigned_reviewer_name?: string | null;
}

export interface InAppNotification {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  recipient_role: string | null;
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error';
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface OrganizationAdminReviewRequest {
  new_status: 'under_review' | 'changes_requested' | 'more_info_required' | 'approved' | 'rejected' | 'provisioning' | 'active';
  review_notes?: string;
  decision_reason?: string;
  internal_notes?: string;
  assigned_reviewer_id?: string;
}

export interface OrganizationAdminAssignReviewerRequest {
  assigned_reviewer_id?: string | null;
  internal_notes?: string;
}

export interface OrganizationAdminNotesRequest {
  internal_notes: string;
}

export interface OrganizationProvisionRequest {
  slug: string;
  primary_color?: string;
  accent_color?: string;
  portal_title?: string;
  custom_welcome_text?: string;
}

export async function registerOrganization(data: OrganizationRegisterRequest): Promise<OrganizationResponse> {
  return apiPost<OrganizationResponse, OrganizationRegisterRequest>('/organizations/register', data);
}

export async function loginOrganization(data: OrganizationLoginRequest): Promise<TokenResponse> {
  return apiPost<TokenResponse, OrganizationLoginRequest>('/organizations/login', data);
}

export async function fetchMyOrganization(): Promise<OrganizationResponse> {
  return apiGet<OrganizationResponse>('/organizations/me');
}

export async function updateMyOrganization(data: OrganizationProfileUpdate): Promise<OrganizationResponse> {
  return apiPut<OrganizationResponse, OrganizationProfileUpdate>('/organizations/me', data);
}

export async function createTemplateRequest(data: OrganizationTemplateRequestCreate): Promise<OrganizationTemplateRequestResponse> {
  const payload = {
    ...data,
    expected_participants: data.estimated_users || 100,
    additional_requirements: data.notes || '',
  };
  return apiPost<OrganizationTemplateRequestResponse, any>('/organizations/template-requests', payload);
}

export async function fetchMyTemplateRequests(): Promise<OrganizationTemplateRequestResponse[]> {
  return apiGet<OrganizationTemplateRequestResponse[]>('/organizations/template-requests');
}

export async function fetchTemplateRequest(requestId: string): Promise<OrganizationTemplateRequestResponse> {
  return apiGet<OrganizationTemplateRequestResponse>(`/organizations/template-requests/${requestId}`);
}

export async function updateTemplateRequest(requestId: string, data: OrganizationTemplateRequestUpdate): Promise<OrganizationTemplateRequestResponse> {
  const payload = {
    ...data,
    ...(data.estimated_users ? { expected_participants: data.estimated_users } : {}),
    ...(data.notes !== undefined ? { additional_requirements: data.notes } : {}),
  };
  return apiPut<OrganizationTemplateRequestResponse, any>(`/organizations/template-requests/${requestId}`, payload);
}

export async function adminFetchOrganizations(): Promise<OrganizationResponse[]> {
  return apiGet<OrganizationResponse[]>('/organizations/admin/all');
}

export async function adminUpdateOrgStatus(orgId: string, status: string): Promise<OrganizationResponse> {
  return apiPut<OrganizationResponse, { status: string }>(`/organizations/admin/${orgId}/status`, { status });
}

export async function adminFetchTemplateRequests(params?: string | { status?: string; search?: string; sortBy?: string }): Promise<AdminTemplateRequestResponse[]> {
  if (typeof params === 'string') {
    const query = params ? `?status_filter=${encodeURIComponent(params)}` : '';
    return apiGet<AdminTemplateRequestResponse[]>(`/organizations/admin/template-requests${query}`);
  }
  const queryParts: string[] = [];
  if (params?.status && params.status !== 'all') queryParts.push(`status_filter=${encodeURIComponent(params.status)}`);
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
  if (params?.sortBy) queryParts.push(`sort_by=${encodeURIComponent(params.sortBy)}`);
  const query = queryParts.length ? `?${queryParts.join('&')}` : '';
  return apiGet<AdminTemplateRequestResponse[]>(`/organizations/admin/template-requests${query}`);
}

export async function adminReviewTemplateRequest(requestId: string, data: OrganizationAdminReviewRequest): Promise<AdminTemplateRequestResponse> {
  return apiPost<AdminTemplateRequestResponse, OrganizationAdminReviewRequest>(`/organizations/admin/template-requests/${requestId}/review`, data);
}

export async function adminAssignReviewer(requestId: string, data: OrganizationAdminAssignReviewerRequest): Promise<AdminTemplateRequestResponse> {
  return apiPost<AdminTemplateRequestResponse, OrganizationAdminAssignReviewerRequest>(`/organizations/admin/template-requests/${requestId}/assign-reviewer`, data);
}

export async function adminUpdateInternalNotes(requestId: string, data: OrganizationAdminNotesRequest): Promise<AdminTemplateRequestResponse> {
  return apiPost<AdminTemplateRequestResponse, OrganizationAdminNotesRequest>(`/organizations/admin/template-requests/${requestId}/internal-notes`, data);
}

export async function adminStartProvisioning(requestId: string): Promise<AdminTemplateRequestResponse> {
  return apiPost<AdminTemplateRequestResponse, any>(`/organizations/admin/template-requests/${requestId}/start-provisioning`, {});
}

export async function adminProvisionWorkspace(requestId: string, data: OrganizationProvisionRequest): Promise<any> {
  return apiPost<any, OrganizationProvisionRequest>(`/organizations/admin/template-requests/${requestId}/provision`, data);
}

// In-App Notifications
export async function fetchInAppNotifications(limit = 30): Promise<InAppNotification[]> {
  return apiGet<InAppNotification[]>(`/notifications?limit=${limit}`);
}

export async function fetchUnreadNotificationCount(): Promise<{ unread_count: number }> {
  return apiGet<{ unread_count: number }>('/notifications/unread-count');
}

export async function markNotificationAsRead(id: string): Promise<InAppNotification> {
  return apiPut<InAppNotification, any>(`/notifications/${id}/read`, {});
}

export async function markAllNotificationsAsRead(): Promise<{ status: string }> {
  return apiPut<{ status: string }, any>('/notifications/read-all', {});
}

export interface PlatformReviewer {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AdminAuditLogItem {
  id: string;
  request_id: string;
  institution_name: string;
  from_status: string | null;
  to_status: string;
  changed_by_email: string;
  changed_by_name: string;
  comments: string | null;
  created_at: string;
}

export async function adminFetchReviewers(): Promise<PlatformReviewer[]> {
  return apiGet<PlatformReviewer[]>('/organizations/admin/reviewers');
}

export async function adminFetchAuditLogs(limit = 100): Promise<AdminAuditLogItem[]> {
  return apiGet<AdminAuditLogItem[]>(`/organizations/admin/audit-logs?limit=${limit}`);
}






