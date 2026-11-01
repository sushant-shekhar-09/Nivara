import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Send,
  ExternalLink,
  Edit3,
  Globe,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  fetchMyOrganization,
  updateMyOrganization,
  fetchMyTemplateRequests,
  createTemplateRequest,
  updateTemplateRequest,
  type OrganizationResponse,
  type OrganizationTemplateRequestResponse,
  type OrganizationTemplateRequestCreate,
  type OrganizationProfileUpdate,
} from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const OrgDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [org, setOrg] = useState<OrganizationResponse | null>(null);
  const [requests, setRequests] = useState<OrganizationTemplateRequestResponse[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'overview' | 'template' | 'profile' | 'features') || 'overview';
  const setActiveTab = (tab: 'overview' | 'template' | 'profile' | 'features') => {
    setSearchParams({ tab });
  };
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Template Request Form State
  type SubmissionState = 'idle' | 'validating' | 'submitting' | 'success' | 'failure';
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [submittedRequestInfo, setSubmittedRequestInfo] = useState<{ id: string; status: string } | null>(null);
  const [templateForm, setTemplateForm] = useState<OrganizationTemplateRequestCreate>({
    intended_use: '',
    requested_plan: 'standard_institution',
    estimated_users: 1000,
    custom_subdomain: '',
    notes: '',
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Edit Resubmission State (for more_info_required)
  const [resubmitId, setResubmitId] = useState<string | null>(null);
  const [resubmitNotes, setResubmitNotes] = useState('');
  const [resubmitting, setResubmitting] = useState(false);

  // Profile Edit State
  const [profileData, setProfileData] = useState<OrganizationProfileUpdate>({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [orgData, requestsData] = await Promise.all([
        fetchMyOrganization(),
        fetchMyTemplateRequests(),
      ]);
      setOrg(orgData);
      setRequests(requestsData);
      setProfileData({
        contact_person_name: orgData.contact_person_name,
        contact_person_designation: orgData.contact_person_designation,
        contact_phone: orgData.contact_phone,
        website: orgData.website || '',
        description: orgData.description || '',
        city: orgData.city,
        state: orgData.state,
        country: orgData.country,
      });
    } catch (err: any) {
      const msg = typeof err?.detail === 'string'
        ? err.detail
        : err?.message || 'Failed to load organization data.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const intended = templateForm.intended_use?.trim() || '';

    if (!intended) {
      errors.intended_use = 'Intended campus or program use is required.';
    } else if (intended.length < 2) {
      errors.intended_use = 'Please provide a descriptive explanation of your intended use.';
    }

    const users = templateForm.estimated_users;
    if (!users || isNaN(users) || users < 10) {
      errors.estimated_users = 'Estimated student count must be at least 10.';
    } else if (users > 1000000) {
      errors.estimated_users = 'Estimated student count cannot exceed 1,000,000.';
    }

    const subdomain = templateForm.custom_subdomain?.trim();
    if (subdomain) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(subdomain)) {
        errors.custom_subdomain = 'Subdomain must contain only lowercase letters, numbers, and hyphens (no leading or trailing hyphens).';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRequest) return;

    setSubmissionState('validating');
    setFormErrorMessage(null);

    const isValid = validateForm();
    if (!isValid) {
      setSubmissionState('failure');
      setFormErrorMessage('Please address the highlighted errors below before submitting.');
      return;
    }

    setSubmissionState('submitting');
    setSubmittingRequest(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createTemplateRequest(templateForm);
      setSubmittedRequestInfo({
        id: result.id,
        status: result.status,
      });
      setSubmissionState('success');
      setSuccess('Your institutional workspace request has been submitted successfully. You can track its status from your Template Requests dashboard.');
      await loadData();
    } catch (err: any) {
      setSubmissionState('failure');
      const msg = typeof err?.detail === 'string'
        ? err.detail
        : err?.message || 'Failed to submit template request. Please check your inputs and try again.';
      setFormErrorMessage(msg);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleResubmit = async (requestId: string) => {
    setResubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await updateTemplateRequest(requestId, {
        notes: resubmitNotes,
      });
      setSuccess('Request updated and resubmitted for review!');
      setResubmitId(null);
      setResubmitNotes('');
      await loadData();
    } catch (err: any) {
      setError(err.detail || 'Failed to resubmit request.');
    } finally {
      setResubmitting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateMyOrganization(profileData);
      setOrg(updated);
      setSuccess('Organization profile updated successfully.');
    } catch (err: any) {
      setError(err.detail || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'provisioned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#1C3A13]/10 text-[#1C3A13] border border-[#1C3A13]/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1C3A13]" />
            WORKSPACE ACTIVE
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            APPROVED
          </span>
        );
      case 'provisioning':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-purple-50 text-purple-800 border border-purple-300 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-purple-600 animate-spin" />
            PROVISIONING
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-50 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5" />
            UNDER REVIEW
          </span>
        );
      case 'pending_review':
      case 'pending_verification':
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-50 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            PENDING REVIEW
          </span>
        );
      case 'changes_requested':
      case 'more_info_required':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-100 text-amber-900 border border-amber-400">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            ACTION REQUIRED
          </span>
        );
      case 'rejected':
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-rose-50 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5" />
            {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#EEEEE9] text-[#6F6D63]">
            {status}
          </span>
        );
    }
  };

  const activeRequest = requests[0];
  const hasActiveRequest = requests.some(r => ['draft', 'submitted', 'pending_review', 'under_review', 'changes_requested', 'more_info_required', 'approved', 'provisioning'].includes(r.status));

  if (isLoading) {
    return (
      <div className="min-h-screen py-24 flex flex-col items-center justify-center bg-[#FBF9F4] space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#1C3A13] border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-[#6F6D63]">Loading institutional portal...</span>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-[#EEEEE9] border border-[#DAD4C8] text-[#1C3A13]">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-2xl sm:text-3xl text-[#2F302B]">
                  {org?.name || 'Institution Dashboard'}
                </h1>
                {org && getStatusBadge(org.account_status || org.status || 'pending_verification')}
              </div>
              <p className="text-xs text-[#6F6D63] font-sans flex flex-wrap items-center gap-4">
                <span className="font-mono text-[#1C3A13] font-semibold">{org?.slug}</span>
                <span>•</span>
                <span>{org?.official_email}</span>
                <span>•</span>
                <span className="capitalize">{org?.org_type.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="rounded-full text-xs font-mono flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-[#536044]/10 border border-[#536044]/30 text-[#1C3A13] text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#536044]" />
            <div className="font-sans leading-relaxed">{error}</div>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-[#1C3A13]/10 border border-[#1C3A13]/30 text-[#1C3A13] text-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="font-sans font-medium">{success}</div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <Card variant="default" padding="lg" className="border-[#DAD4C8] bg-[#FCFCF7] rounded-3xl space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#6F6D63]">
                  Account Status
                </span>
                <div className="flex items-center justify-between pt-1">
                  <h3 className="font-serif text-xl text-[#2F302B] capitalize">
                    {(org?.account_status || org?.status || 'pending_verification').replace('_', ' ')}
                  </h3>
                  {org && getStatusBadge(org.account_status || org.status || 'pending_verification')}
                </div>
                <p className="text-xs text-[#6F6D63] font-sans pt-2">
                  {(org?.account_status || org?.status) === 'pending_verification'
                    ? 'Registration submitted and awaiting administrator institutional audit.'
                    : 'Account verified. You have full access to request institutional templates.'}
                </p>
              </Card>

              {/* Card 2 */}
              <Card variant="default" padding="lg" className="border-[#DAD4C8] bg-[#FCFCF7] rounded-3xl space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#6F6D63]">
                  Workspace Template
                </span>
                <div className="flex items-center justify-between pt-1">
                  <h3 className="font-serif text-xl text-[#2F302B]">
                    {activeRequest ? (activeRequest.requested_plan || 'standard_institution').replace('_', ' ') : 'None Active'}
                  </h3>
                  {activeRequest && getStatusBadge(activeRequest.status)}
                </div>
                <p className="text-xs text-[#6F6D63] font-sans pt-2">
                  {activeRequest?.provisioned_tenant_id
                    ? 'Workspace provisioned and active.'
                    : activeRequest
                    ? `Current request status: ${activeRequest.status.replace('_', ' ')}.`
                    : 'Submit a request to configure a dedicated campus tenant.'}
                </p>
              </Card>

              {/* Card 3 */}
              <Card variant="default" padding="lg" className="border-[#DAD4C8] bg-[#FCFCF7] rounded-3xl space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#6F6D63]">
                  Authorized Contact
                </span>
                <div className="pt-1">
                  <h3 className="font-serif text-lg text-[#2F302B]">{org?.contact_person_name}</h3>
                  <span className="text-xs text-[#6F6D63]">{org?.contact_person_designation}</span>
                </div>
                <div className="text-xs text-[#6F6D63] font-sans pt-2 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#9A988D]" />
                    <span>{org?.contact_phone}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Action Banner */}
            {!hasActiveRequest && (
              <div className="p-8 rounded-3xl bg-[#1C3A13] text-[#FCFCF7] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <span className="text-[11px] font-mono text-[#D3FA99] uppercase tracking-wider font-semibold">
                    Get Started With Your Custom Institutional Workspace
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl">
                    Request an Institutional Nivara Template
                  </h2>
                  <p className="text-xs text-[#FCFCF7]/80 font-sans leading-relaxed">
                    Deploy an isolated, branded student mental-health screening portal with aggregate risk analytics, counsellor triage pipelines, and deterministic crisis escalation.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setActiveTab('template');
                    setShowRequestForm(true);
                  }}
                  className="bg-[#D3FA99] text-[#1C3A13] hover:bg-[#bbf070] font-semibold px-6 py-3 rounded-full flex-shrink-0"
                >
                  Configure Template Request
                </Button>
              </div>
            )}

            {/* If Provisioned, showcase the active tenant */}
            {activeRequest?.status === 'provisioned' && (
              <Card variant="default" padding="lg" className="border-[#1C3A13]/30 bg-[#1C3A13]/5 rounded-3xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#1C3A13] font-semibold">
                      Live Institutional Tenant
                    </span>
                    <h3 className="font-serif text-2xl text-[#2F302B]">
                      Workspace Successfully Deployed
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#1C3A13] text-[#FCFCF7]">
                    PROVISIONED
                  </span>
                </div>
                <p className="text-xs text-[#6F6D63] font-sans leading-relaxed">
                  Your campus workspace is provisioned and ready for student screenings and counselling oversight.
                </p>
                <div className="pt-2 flex flex-wrap gap-4">
                  <Link
                    to={`/screening?tenant=${activeRequest.custom_subdomain || org?.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C3A13] text-[#FCFCF7] text-xs font-semibold hover:bg-[#142B0E]"
                  >
                    <span>Launch Student Screening Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/counsellor"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#DAD4C8] bg-[#FCFCF7] text-[#2F302B] text-xs font-semibold hover:bg-[#EEEEE9]"
                  >
                    <span>Counsellor Triage Portal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 2: TEMPLATE REQUESTS */}
        {activeTab === 'template' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-[#2F302B]">Institutional Template Requests</h2>
                <p className="text-xs text-[#6F6D63] font-sans">
                  Manage, submit, and track the status of your organization's custom workspace templates.
                </p>
              </div>

              {!hasActiveRequest && !showRequestForm && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowRequestForm(true)}
                  className="rounded-full text-xs font-semibold flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>New Workspace Request</span>
                </Button>
              )}
            </div>

            {/* Request Form (if opened) */}
            {showRequestForm && (
              submissionState === 'success' ? (
                <Card variant="default" padding="lg" className="border-[#1C3A13]/30 bg-[#FCFCF7] rounded-3xl p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D3FA99] flex items-center justify-center text-[#1C3A13]">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-[#2F302B]">
                        Workspace Request Submitted
                      </h3>
                      <span className="font-mono text-xs text-[#1C3A13] uppercase tracking-wider font-semibold">
                        Status: {submittedRequestInfo?.status ? submittedRequestInfo.status.toUpperCase() : 'SUBMITTED'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#2F302B] font-sans leading-relaxed bg-[#FBF9F4] p-4 rounded-2xl border border-[#DAD4C8]">
                    Your institutional workspace request has been submitted successfully. You can track its status from your Template Requests dashboard.
                  </p>

                  {submittedRequestInfo?.id && (
                    <div className="p-3.5 rounded-2xl bg-[#EEEEE9] text-xs font-mono space-y-1">
                      <span className="text-[#6F6D63] text-[10px] uppercase block">Request Reference ID:</span>
                      <span className="font-semibold text-[#1C3A13] select-all">{submittedRequestInfo.id}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setShowRequestForm(false);
                        setSubmissionState('idle');
                        setSubmittedRequestInfo(null);
                        setFormErrorMessage(null);
                        setFieldErrors({});
                      }}
                      className="rounded-full font-semibold"
                    >
                      View in Template Requests Dashboard
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card variant="default" padding="lg" className="border-[#DAD4C8] bg-[#FCFCF7] rounded-3xl space-y-6">
                  <div className="flex items-center justify-between border-b border-[#EEEEE9] pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#1C3A13]" />
                      <h3 className="font-serif text-xl text-[#2F302B]">
                        Request Institutional Workspace Template
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setShowRequestForm(false);
                        setSubmissionState('idle');
                        setFormErrorMessage(null);
                        setFieldErrors({});
                      }}
                      disabled={submittingRequest}
                      className="text-xs text-[#6F6D63] hover:text-[#2F302B] font-mono disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Form Error Banner */}
                  {formErrorMessage && (
                    <div className="p-4 rounded-2xl bg-[#536044]/10 border border-[#536044]/30 text-[#1C3A13] text-xs flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#536044]" />
                      <div className="font-sans leading-relaxed">{formErrorMessage}</div>
                    </div>
                  )}

                  <form onSubmit={handleCreateRequest} className="space-y-4 font-sans text-xs">
                    <div>
                      <label className="block font-mono font-medium text-[#2F302B] uppercase tracking-wider mb-1.5">
                        Intended Campus / Program Use *
                      </label>
                      <textarea
                        required
                        rows={3}
                        disabled={submittingRequest}
                        value={templateForm.intended_use}
                        onChange={(e) => {
                          setTemplateForm({ ...templateForm, intended_use: e.target.value });
                          if (fieldErrors.intended_use) {
                            setFieldErrors({ ...fieldErrors, intended_use: '' });
                          }
                        }}
                        placeholder="e.g. Campus-wide proactive screening for incoming students with counsellor triage."
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          fieldErrors.intended_use ? 'border-rose-500' : 'border-[#DAD4C8]'
                        } bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13] disabled:opacity-60`}
                      />
                      {fieldErrors.intended_use && (
                        <p className="text-rose-600 text-[11px] font-sans mt-1">
                          {fieldErrors.intended_use}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-mono font-medium text-[#2F302B] uppercase tracking-wider mb-1.5">
                          Requested Plan *
                        </label>
                        <select
                          disabled={submittingRequest}
                          value={templateForm.requested_plan}
                          onChange={(e) => setTemplateForm({ ...templateForm, requested_plan: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13] disabled:opacity-60"
                        >
                          <option value="standard_institution">Standard Institution</option>
                          <option value="consortium">Multi-Campus Consortium</option>
                          <option value="enterprise_custom">Enterprise Custom</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-mono font-medium text-[#2F302B] uppercase tracking-wider mb-1.5">
                          Estimated Students / Users *
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={1000000}
                          required
                          disabled={submittingRequest}
                          value={templateForm.estimated_users}
                          onChange={(e) => {
                            setTemplateForm({ ...templateForm, estimated_users: parseInt(e.target.value) || 100 });
                            if (fieldErrors.estimated_users) {
                              setFieldErrors({ ...fieldErrors, estimated_users: '' });
                            }
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl border ${
                            fieldErrors.estimated_users ? 'border-rose-500' : 'border-[#DAD4C8]'
                          } bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13] disabled:opacity-60`}
                        />
                        {fieldErrors.estimated_users && (
                          <p className="text-rose-600 text-[11px] font-sans mt-1">
                            {fieldErrors.estimated_users}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block font-mono font-medium text-[#2F302B] uppercase tracking-wider mb-1.5">
                          Preferred Subdomain / Slug
                        </label>
                        <input
                          type="text"
                          disabled={submittingRequest}
                          value={templateForm.custom_subdomain}
                          onChange={(e) => {
                            setTemplateForm({ ...templateForm, custom_subdomain: e.target.value.toLowerCase() });
                            if (fieldErrors.custom_subdomain) {
                              setFieldErrors({ ...fieldErrors, custom_subdomain: '' });
                            }
                          }}
                          placeholder="e.g. nitk-wellness"
                          className={`w-full px-4 py-2.5 rounded-xl border ${
                            fieldErrors.custom_subdomain ? 'border-rose-500' : 'border-[#DAD4C8]'
                          } bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13] disabled:opacity-60`}
                        />
                        {fieldErrors.custom_subdomain && (
                          <p className="text-rose-600 text-[11px] font-sans mt-1">
                            {fieldErrors.custom_subdomain}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono font-medium text-[#2F302B] uppercase tracking-wider mb-1.5">
                        Specific Requirements & Technical Notes
                      </label>
                      <textarea
                        rows={2}
                        disabled={submittingRequest}
                        value={templateForm.notes}
                        onChange={(e) => setTemplateForm({ ...templateForm, notes: e.target.value })}
                        placeholder="e.g. Specific on-campus crisis helpline numbers, custom intake questionnaires, or IRB research data exports."
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13] disabled:opacity-60"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={submittingRequest}
                        onClick={() => {
                          setShowRequestForm(false);
                          setSubmissionState('idle');
                          setFormErrorMessage(null);
                          setFieldErrors({});
                        }}
                        className="rounded-full"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={submittingRequest}
                        className="rounded-full font-semibold flex items-center gap-2"
                      >
                        {submittingRequest && (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        )}
                        <span>
                          {submittingRequest
                            ? 'Submitting Request...'
                            : submissionState === 'failure'
                            ? 'Retry Submission'
                            : 'Submit Institutional Request'}
                        </span>
                      </Button>
                    </div>
                  </form>
                </Card>
              )
            )}

            {/* List of Requests */}
            {requests.length === 0 && !showRequestForm ? (
              <Card variant="default" padding="lg" className="border-[#DAD4C8] bg-[#FCFCF7] rounded-3xl text-center py-12 space-y-3">
                <FileText className="w-10 h-10 text-[#9A988D] mx-auto" />
                <h3 className="font-serif text-lg text-[#2F302B]">No Requests Submitted Yet</h3>
                <p className="text-xs text-[#6F6D63] max-w-sm mx-auto font-sans">
                  Your institution does not have any active template requests. Click below to submit your requirements.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowRequestForm(true)}
                    className="rounded-full font-semibold"
                  >
                    Request Institutional Workspace
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {requests.map((req) => (
                  <Card
                    key={req.id}
                    variant="default"
                    padding="lg"
                    className="border-[#DAD4C8] bg-[#FCFCF7] rounded-3xl space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EEEEE9] pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-[#6F6D63] uppercase">Request ID:</span>
                          <span className="font-mono text-xs text-[#1C3A13] font-semibold">{req.id.substring(0, 8)}</span>
                          {getStatusBadge(req.status)}
                        </div>
                        <h4 className="font-serif text-xl text-[#2F302B] capitalize">
                          {(req.requested_plan || 'standard_institution').replace('_', ' ')} Plan
                        </h4>
                      </div>

                      <div className="text-xs text-[#6F6D63] font-mono">
                        Submitted: {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                      <div className="p-3.5 rounded-2xl bg-[#EEEEE9]">
                        <span className="text-[10px] font-mono text-[#6F6D63] uppercase block mb-1">
                          Estimated Scale
                        </span>
                        <span className="font-serif text-lg text-[#2F302B]">
                          {(req.estimated_users || req.expected_participants || 1000).toLocaleString()} Students
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#EEEEE9]">
                        <span className="text-[10px] font-mono text-[#6F6D63] uppercase block mb-1">
                          Preferred Slug / Domain
                        </span>
                        <span className="font-mono text-sm text-[#1C3A13] font-semibold">
                          {req.custom_subdomain || org?.slug}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#EEEEE9]">
                        <span className="text-[10px] font-mono text-[#6F6D63] uppercase block mb-1">
                          Provisioning Status
                        </span>
                        <span className="font-sans text-sm text-[#2F302B]">
                          {req.provisioned_tenant_id ? 'Workspace Active' : 'Pending Review'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#6F6D63] block mb-1">
                        Intended Use
                      </span>
                      <p className="text-xs text-[#2F302B] bg-[#FBF9F4] p-3 rounded-xl border border-[#EEEEE9]">
                        {req.intended_use}
                      </p>
                    </div>

                    {req.admin_notes && (
                      <div className="p-4 rounded-2xl bg-[#1C3A13]/5 border border-[#1C3A13]/20 space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#1C3A13] font-semibold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Administrator Feedback
                        </span>
                        <p className="text-xs text-[#2F302B] font-sans leading-relaxed">
                          {req.admin_notes}
                        </p>
                      </div>
                    )}

                    {/* APPROVED STATE */}
                    {req.status === 'approved' && (
                      <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 font-mono">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Institutional Request Approved</span>
                        </div>
                        <p className="text-xs text-emerald-950 font-sans leading-relaxed">
                          Your institutional workspace template request has been officially approved! Platform administrators are preparing your tenant database, crisis helpline configuration, and custom branding. You will receive an in-app notice when your workspace is live.
                        </p>
                      </div>
                    )}

                    {/* PROVISIONING STATE */}
                    {req.status === 'provisioning' && (
                      <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 font-mono">
                          <Clock className="w-4 h-4 text-purple-700 animate-spin" />
                          <span>Infrastructure Deployment in Progress</span>
                        </div>
                        <p className="text-xs text-purple-950 font-sans leading-relaxed">
                          Your dedicated workspace environment is currently being provisioned. This includes tenant routing, campus crisis contacts, and student privacy boundaries.
                        </p>
                      </div>
                    )}

                    {/* ACTIVE / PROVISIONED STATE */}
                    {(req.status === 'active' || req.status === 'provisioned') && (
                      <div className="p-5 rounded-2xl bg-[#1C3A13]/5 border border-[#1C3A13]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#1C3A13] font-mono">
                            <CheckCircle2 className="w-4 h-4 text-[#1C3A13]" />
                            <span>Workspace Environment Live & Verified</span>
                          </div>
                          <p className="text-xs text-[#2F302B] font-sans">
                            Your campus portal is deployed and available for student wellbeing screening.
                          </p>
                        </div>
                        <a
                          href={`/screening?tenant=${req.custom_subdomain || org?.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-[#1C3A13] text-[#FCFCF7] flex items-center justify-center gap-2 hover:bg-[#2F302B] transition-colors whitespace-nowrap"
                        >
                          <span>Open Campus Portal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Resubmission Section for changes_requested / more_info_required */}
                    {(req.status === 'changes_requested' || req.status === 'more_info_required') && (
                      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 font-mono">
                          <AlertCircle className="w-4 h-4 text-amber-700" />
                          <span>Clarification / Changes Requested by Platform Reviewer</span>
                        </div>
                        {(req.admin_notes || req.decision_reason) && (
                          <p className="text-xs text-amber-950 font-sans leading-relaxed bg-white/60 p-3 rounded-xl border border-amber-200">
                            <span className="font-semibold block font-mono text-[10px] uppercase text-amber-800 mb-0.5">Reviewer Feedback:</span>
                            {req.decision_reason || req.admin_notes}
                          </p>
                        )}
                        <p className="text-xs text-[#6F6D63] font-sans">
                          Please provide the requested information below and resubmit your application for platform approval.
                        </p>

                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={resubmitId === req.id ? resubmitNotes : ''}
                            onChange={(e) => {
                              setResubmitId(req.id);
                              setResubmitNotes(e.target.value);
                            }}
                            placeholder="Type clarification notes, updated institutional details, or verification answers here..."
                            className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-xs text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13]"
                          />
                          <div className="flex justify-end">
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={resubmitting || !resubmitNotes.trim()}
                              onClick={() => handleResubmit(req.id)}
                              className="rounded-full text-xs font-semibold"
                            >
                              {resubmitting ? 'Submitting...' : 'Submit Clarification'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* REJECTED STATE */}
                    {req.status === 'rejected' && (
                      <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-rose-900 font-mono">
                          <AlertCircle className="w-4 h-4 text-rose-700" />
                          <span>Application Not Approved</span>
                        </div>
                        <p className="text-xs text-rose-950 font-sans leading-relaxed">
                          <span className="font-semibold block font-mono text-[10px] uppercase text-rose-800 mb-0.5">Decision Reason:</span>
                          {req.decision_reason || req.admin_notes || 'The request did not satisfy current institutional verification requirements.'}
                        </p>
                        <div className="text-[11px] text-[#6F6D63] font-sans pt-1 border-t border-rose-200">
                          If you have updated institutional documentation or wish to appeal this decision, please contact the Nivara Verification Office at <span className="font-mono font-medium text-[#1C3A13]">contact@nivara.ac.in</span>.
                        </div>
                      </div>
                    )}

                    {/* Audit Timeline */}
                    {req.history && req.history.length > 0 && (
                      <div className="border-t border-[#EEEEE9] pt-4 space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6D63] block">
                          Request History & Audit Log
                        </span>
                        <div className="space-y-1.5">
                          {req.history.map((h) => (
                            <div key={h.id} className="text-[11px] font-sans flex items-center gap-3 text-[#6F6D63]">
                              <span className="font-mono text-[10px] text-[#9A988D]">
                                {new Date(h.created_at).toLocaleString()}
                              </span>
                              <span>•</span>
                              <span className="font-semibold text-[#2F302B]">
                                Status transitioned to <span className="font-mono">{h.new_status}</span>
                              </span>
                              {h.reason_or_notes && (
                                <span className="text-[#6F6D63] italic">({h.reason_or_notes})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INSTITUTION PROFILE */}
        {activeTab === 'profile' && (
          <Card variant="default" padding="lg" className="border-[#DAD4C8] bg-[#FCFCF7] rounded-3xl space-y-6">
            <div className="border-b border-[#EEEEE9] pb-3">
              <h3 className="font-serif text-2xl text-[#2F302B]">Institution Profile & Contact Details</h3>
              <p className="text-xs text-[#6F6D63] font-sans">
                Keep official institutional points of contact updated for security and workspace notices.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-medium text-[#2F302B] uppercase tracking-wider mb-1.5">
                    Authorized Contact Name
                  </label>
                  <input
                    type="text"
                    value={profileData.contact_person_name || ''}
                    onChange={(e) => setProfileData({ ...profileData, contact_person_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13]"
                  />
                </div>

                <div>
                  <label className="block font-mono font-medium text-[#2F302B] uppercase tracking-wider mb-1.5">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={profileData.contact_person_designation || ''}
                    onChange={(e) => setProfileData({ ...profileData, contact_person_designation: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13]"
                  />
                </div>

                <div>
                  <label className="block font-mono font-medium text-[#2F302B] uppercase tracking-wider mb-1.5">
                    Direct Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.contact_phone || ''}
                    onChange={(e) => setProfileData({ ...profileData, contact_phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13]"
                  />
                </div>

                <div>
                  <label className="block font-mono font-medium text-[#2F302B] uppercase tracking-wider mb-1.5">
                    Official Website
                  </label>
                  <input
                    type="url"
                    value={profileData.website || ''}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13]"
                  />
                </div>

                <div>
                  <label className="block font-mono font-medium text-[#2F302B] uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={profileData.city || ''}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13]"
                  />
                </div>

                <div>
                  <label className="block font-mono font-medium text-[#2F302B] uppercase tracking-wider mb-1.5">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={profileData.state || ''}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono font-medium text-[#2F302B] uppercase tracking-wider mb-1.5">
                  Institutional Scope / Wellness Description
                </label>
                <textarea
                  rows={3}
                  value={profileData.description || ''}
                  onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isUpdatingProfile}
                  className="rounded-full font-semibold px-6"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* TAB 4: INSTITUTIONAL FEATURES PREVIEW */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="border-b border-[#DAD4C8] pb-3">
              <h3 className="font-serif text-2xl text-[#2F302B]">Nivara Institutional Architecture Modules</h3>
              <p className="text-xs text-[#6F6D63] font-sans">
                Core infrastructure activated automatically upon workspace provisioning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="default" padding="lg" className="border-[#DAD4C8] bg-[#FCFCF7] rounded-3xl space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1C3A13]/10 text-[#1C3A13] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-[#2F302B]">Zero-PII Student Privacy Barrier</h4>
                <p className="text-xs text-[#6F6D63] font-sans leading-relaxed">
                  Students complete screening completely decoupled from academic IDs or institutional single-sign-on. Aggregated cohort analytics preserve complete mathematical k-anonymity.
                </p>
              </Card>

              <Card variant="default" padding="lg" className="border-[#DAD4C8] bg-[#FCFCF7] rounded-3xl space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1C3A13]/10 text-[#1C3A13] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-[#2F302B]">Screening Campaigns & Cohorts</h4>
                <p className="text-xs text-[#6F6D63] font-sans leading-relaxed">
                  Schedule time-bounded campus screening drives (e.g. Mid-term exam stress index, Freshman transition) with dedicated campaign QR codes and departmental breakdown.
                </p>
              </Card>

              <Card variant="default" padding="lg" className="border-[#DAD4C8] bg-[#FCFCF7] rounded-3xl space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1C3A13]/10 text-[#1C3A13] flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-[#2F302B]">IRB Research Survey Consortium</h4>
                <p className="text-xs text-[#6F6D63] font-sans leading-relaxed">
                  Contribute de-identified cross-sectional mental wellness data to IRB-approved academic research consortiums with differential privacy noise guarantees.
                </p>
              </Card>

              <Card variant="default" padding="lg" className="border-[#DAD4C8] bg-[#FCFCF7] rounded-3xl space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1C3A13]/10 text-[#1C3A13] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-[#2F302B]">Deterministic Safety Sanctuary</h4>
                <p className="text-xs text-[#6F6D63] font-sans leading-relaxed">
                  Sub-millisecond rule-based safety triggers guarantee students exhibiting critical crisis signals are immediately routed to emergency helplines and campus resources.
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

