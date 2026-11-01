import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Building2,
  Palette,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  ArrowRight,
  Eye,
  Save,
  Clock,
  Info,
  FileText,
  ExternalLink,
  Search,
  Filter,
  UserCheck,
  History,
  Sparkles,
  RefreshCw,
  AlertCircle,
  X,
  ChevronDown,
  Layers,
  Send,
  Check,
  Settings,
  HelpCircle,
  Hash,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';
import {
  adminFetchOrganizations,
  adminUpdateOrgStatus,
  adminFetchTemplateRequests,
  adminReviewTemplateRequest,
  adminAssignReviewer,
  adminUpdateInternalNotes,
  adminStartProvisioning,
  adminProvisionWorkspace,
  adminFetchReviewers,
  adminFetchAuditLogs,
  fetchTenantPublicConfig,
  updateTenantBranding,
  fetchTenantStaff,
  addTenantStaff,
  type OrganizationResponse,
  type AdminTemplateRequestResponse,
  type PlatformReviewer,
  type AdminAuditLogItem,
  type TenantPublicConfig,
  type TenantStaffMember,
} from '../lib/api';

type TabKey = 'overview' | 'requests' | 'institutions' | 'workspaces' | 'staff' | 'audit';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabKey) || 'overview';
  const setActiveTab = (tab: TabKey) => setSearchParams({ tab });

  // Core Data States
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Entities
  const [requests, setRequests] = useState<AdminTemplateRequestResponse[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [reviewers, setReviewers] = useState<PlatformReviewer[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogItem[]>([]);

  // Requests Queue Filters & Search
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');
  const [requestSearchQuery, setRequestSearchQuery] = useState<string>('');
  const [requestSortBy, setRequestSortBy] = useState<string>('priority');

  // Request Detail / Verification Modal
  const [selectedReq, setSelectedReq] = useState<AdminTemplateRequestResponse | null>(null);
  const [internalNotesInput, setInternalNotesInput] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState<boolean>(false);
  const [assignedReviewerId, setAssignedReviewerId] = useState<string>('');
  const [assigningReviewer, setAssigningReviewer] = useState<boolean>(false);

  // Decision Modal State (Changes Requested / Rejection)
  const [decisionModalMode, setDecisionModalMode] = useState<'changes' | 'reject' | null>(null);
  const [decisionReasonText, setDecisionReasonText] = useState<string>('');
  const [decisionSubmitting, setDecisionSubmitting] = useState<boolean>(false);

  // Provisioning Modal State
  const [provisioningModalOpen, setProvisioningModalOpen] = useState<boolean>(false);
  const [provisionSlug, setProvisionSlug] = useState<string>('');
  const [provisionPrimaryColor, setProvisionPrimaryColor] = useState<string>('#1C3A13');
  const [provisionAccentColor, setProvisionAccentColor] = useState<string>('#D3FA99');
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);

  // Verification Checklist State (per request)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    domainVerified: false,
    repConfirmed: false,
    scaleValidated: false,
    complianceChecked: false,
    subdomainChecked: false,
  });

  // Workspaces Tab State
  const [selectedTenantSlug, setSelectedTenantSlug] = useState<string>('');
  const [tenantConfig, setTenantConfig] = useState<TenantPublicConfig | null>(null);
  const [tenantStaff, setTenantStaff] = useState<TenantStaffMember[]>([]);
  const [loadingTenantData, setLoadingTenantData] = useState<boolean>(false);

  // New Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState<boolean>(false);
  const [newStaffEmail, setNewStaffEmail] = useState<string>('');
  const [newStaffPassword, setNewStaffPassword] = useState<string>('');
  const [newStaffRole, setNewStaffRole] = useState<string>('counsellor');
  const [isAddingStaff, setIsAddingStaff] = useState<boolean>(false);

  // Branding Edit State
  const [editBrandingOpen, setEditBrandingOpen] = useState<boolean>(false);
  const [brandingPrimary, setBrandingPrimary] = useState<string>('#1C3A13');
  const [brandingAccent, setBrandingAccent] = useState<string>('#D3FA99');
  const [brandingTitle, setBrandingTitle] = useState<string>('');
  const [brandingEmail, setBrandingEmail] = useState<string>('');
  const [brandingPhone, setBrandingPhone] = useState<string>('');
  const [brandingWelcome, setBrandingWelcome] = useState<string>('');
  const [isSavingBranding, setIsSavingBranding] = useState<boolean>(false);

  // Initial Load
  const loadAllAdminData = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const [reqs, orgs, revs, logs] = await Promise.all([
        adminFetchTemplateRequests({ status: requestStatusFilter, search: requestSearchQuery, sortBy: requestSortBy }),
        adminFetchOrganizations(),
        adminFetchReviewers().catch(() => []),
        adminFetchAuditLogs(100).catch(() => []),
      ]);
      setRequests(reqs);
      setOrganizations(orgs);
      setReviewers(revs);
      setAuditLogs(logs);

      // Default tenant selection for workspaces tab
      const firstActive = orgs.find(o => o.status === 'active' && o.slug);
      if (firstActive && !selectedTenantSlug) {
        setSelectedTenantSlug(firstActive.slug);
      }
    } catch (err: any) {
      setErrorNotice(err?.detail || err?.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [requestStatusFilter, requestSortBy]);

  // Load tenant specific data when selectedTenantSlug changes
  useEffect(() => {
    if (selectedTenantSlug && activeTab === 'workspaces') {
      loadTenantDetails(selectedTenantSlug);
    }
  }, [selectedTenantSlug, activeTab]);

  const loadTenantDetails = async (slug: string) => {
    setLoadingTenantData(true);
    try {
      const [cfg, staff] = await Promise.all([
        fetchTenantPublicConfig(slug).catch(() => null),
        fetchTenantStaff(slug).catch(() => []),
      ]);
      setTenantConfig(cfg);
      setTenantStaff(staff);
      if (cfg?.branding) {
        setBrandingPrimary(cfg.branding.primary_color || '#1C3A13');
        setBrandingAccent(cfg.branding.accent_color || '#D3FA99');
        setBrandingTitle(cfg.branding.portal_title || 'Student Wellbeing Sanctuary');
        setBrandingEmail(cfg.branding.support_email || '');
        setBrandingPhone(cfg.branding.support_phone || '');
        setBrandingWelcome(cfg.branding.custom_welcome_text || '');
      }
    } finally {
      setLoadingTenantData(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllAdminData();
  };

  const openRequestDetail = (req: AdminTemplateRequestResponse) => {
    setSelectedReq(req);
    setInternalNotesInput(req.internal_notes || '');
    setAssignedReviewerId(req.assigned_reviewer_id || '');
    // Reset verification checklist for this session
    setChecklist({
      domainVerified: !!req.organization?.official_email?.includes('.edu') || !!req.organization?.official_email?.includes('.ac.'),
      repConfirmed: !!req.organization?.contact_person_name,
      scaleValidated: (req.expected_participants || 0) > 0,
      complianceChecked: true,
      subdomainChecked: !!(req.custom_subdomain || req.organization?.slug),
    });
  };

  const closeRequestDetail = () => {
    setSelectedReq(null);
    setDecisionModalMode(null);
    setDecisionReasonText('');
    setProvisioningModalOpen(false);
  };

  // 1. Assign Reviewer
  const handleAssignReviewer = async () => {
    if (!selectedReq) return;
    setAssigningReviewer(true);
    try {
      const updated = await adminAssignReviewer(selectedReq.id, {
        assigned_reviewer_id: assignedReviewerId || undefined,
        internal_notes: internalNotesInput.trim() || undefined,
      });
      setSelectedReq(updated);
      setSuccessNotice('Assigned reviewer updated successfully.');
      setTimeout(() => setSuccessNotice(null), 3000);
      loadAllAdminData();
    } catch (err: any) {
      setErrorNotice(err?.detail || 'Failed to assign reviewer.');
    } finally {
      setAssigningReviewer(false);
    }
  };

  // 2. Save Internal Notes
  const handleSaveInternalNotes = async () => {
    if (!selectedReq) return;
    setSavingNotes(true);
    try {
      const updated = await adminUpdateInternalNotes(selectedReq.id, {
        internal_notes: internalNotesInput,
      });
      setSelectedReq(updated);
      setSuccessNotice('Internal administrator notes saved.');
      setTimeout(() => setSuccessNotice(null), 3000);
      loadAllAdminData();
    } catch (err: any) {
      setErrorNotice(err?.detail || 'Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  // 3. Mark Under Review
  const handleMarkUnderReview = async () => {
    if (!selectedReq) return;
    try {
      const updated = await adminReviewTemplateRequest(selectedReq.id, {
        new_status: 'under_review',
        review_notes: 'Administrator initiated preliminary institutional verification review.',
        internal_notes: internalNotesInput || undefined,
        assigned_reviewer_id: assignedReviewerId || undefined,
      });
      setSelectedReq(updated);
      setSuccessNotice('Request is now UNDER_REVIEW.');
      setTimeout(() => setSuccessNotice(null), 3000);
      loadAllAdminData();
    } catch (err: any) {
      setErrorNotice(err?.detail || 'Failed to update review status.');
    }
  };

  // 4. Submit Decision (Changes Requested or Rejection)
  const handleSubmitDecision = async () => {
    if (!selectedReq || !decisionModalMode) return;
    if (!decisionReasonText.trim() || decisionReasonText.trim().length < 5) {
      setErrorNotice('A detailed decision reason (minimum 5 characters) is required for this action.');
      return;
    }

    setDecisionSubmitting(true);
    try {
      const newStatus = decisionModalMode === 'changes' ? 'changes_requested' : 'rejected';
      const updated = await adminReviewTemplateRequest(selectedReq.id, {
        new_status: newStatus,
        decision_reason: decisionReasonText.trim(),
        review_notes: decisionReasonText.trim(),
        internal_notes: internalNotesInput || undefined,
      });
      setSelectedReq(updated);
      setDecisionModalMode(null);
      setDecisionReasonText('');
      setSuccessNotice(`Request successfully marked as ${newStatus.toUpperCase()}. Notification dispatched.`);
      setTimeout(() => setSuccessNotice(null), 4000);
      loadAllAdminData();
    } catch (err: any) {
      setErrorNotice(err?.detail || 'Failed to submit decision.');
    } finally {
      setDecisionSubmitting(false);
    }
  };

  // 5. Approve Request
  const handleApproveRequest = async () => {
    if (!selectedReq) return;
    try {
      const updated = await adminReviewTemplateRequest(selectedReq.id, {
        new_status: 'approved',
        review_notes: 'Institutional credentials and compliance requirements verified. Workspace approval granted.',
        internal_notes: internalNotesInput || undefined,
      });
      setSelectedReq(updated);
      setSuccessNotice('Request APPROVED. It is now ready for infrastructure provisioning.');
      setTimeout(() => setSuccessNotice(null), 4000);
      loadAllAdminData();
    } catch (err: any) {
      setErrorNotice(err?.detail || 'Failed to approve request.');
    }
  };

  // 6. Start Provisioning
  const handleStartProvisioning = async () => {
    if (!selectedReq) return;
    try {
      const updated = await adminStartProvisioning(selectedReq.id);
      setSelectedReq(updated);
      setSuccessNotice('Request transitioned to PROVISIONING pipeline.');
      setTimeout(() => setSuccessNotice(null), 3000);
      loadAllAdminData();
    } catch (err: any) {
      setErrorNotice(err?.detail || 'Failed to start provisioning.');
    }
  };

  // 7. Provision & Activate Workspace
  const handleProvisionWorkspace = async () => {
    if (!selectedReq) return;
    const targetSlug = provisionSlug.trim() || selectedReq.custom_subdomain || selectedReq.organization?.slug || `tenant-${selectedReq.id.substring(0, 6)}`;
    setIsProvisioning(true);
    try {
      const res = await adminProvisionWorkspace(selectedReq.id, {
        slug: targetSlug,
        primary_color: provisionPrimaryColor,
        accent_color: provisionAccentColor,
      });
      setSuccessNotice(`Workspace successfully provisioned! Tenant "${res.tenant_slug}" is active and live.`);
      setProvisioningModalOpen(false);
      closeRequestDetail();
      setTimeout(() => setSuccessNotice(null), 5000);
      loadAllAdminData();
    } catch (err: any) {
      setErrorNotice(err?.detail || 'Failed to provision tenant workspace.');
    } finally {
      setIsProvisioning(false);
    }
  };

  // 8. Update Org Verification Status
  const handleUpdateOrgStatus = async (orgId: string, newStatus: string) => {
    try {
      await adminUpdateOrgStatus(orgId, newStatus);
      setSuccessNotice(`Organization account verification status set to ${newStatus}.`);
      setTimeout(() => setSuccessNotice(null), 3000);
      loadAllAdminData();
    } catch (err: any) {
      setErrorNotice(err?.detail || 'Failed to update organization status.');
    }
  };

  // 9. Save Tenant Branding
  const handleSaveBranding = async () => {
    if (!selectedTenantSlug) return;
    setIsSavingBranding(true);
    try {
      await updateTenantBranding(selectedTenantSlug, {
        primary_color: brandingPrimary,
        accent_color: brandingAccent,
        portal_title: brandingTitle,
        support_email: brandingEmail || undefined,
        support_phone: brandingPhone || undefined,
        custom_welcome_text: brandingWelcome || undefined,
      });
      setSuccessNotice('Workspace branding and theme configuration updated.');
      setEditBrandingOpen(false);
      setTimeout(() => setSuccessNotice(null), 3000);
      loadTenantDetails(selectedTenantSlug);
    } catch (err: any) {
      setErrorNotice(err?.detail || 'Failed to update branding.');
    } finally {
      setIsSavingBranding(false);
    }
  };

  // 10. Add Tenant Staff
  const handleAddStaffMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantSlug) return;
    setIsAddingStaff(true);
    try {
      await addTenantStaff(selectedTenantSlug, {
        email: newStaffEmail.trim(),
        password: newStaffPassword,
        role: newStaffRole,
      });
      setSuccessNotice(`Added ${newStaffRole} account for ${newStaffEmail}.`);
      setShowAddStaffModal(false);
      setNewStaffEmail('');
      setNewStaffPassword('');
      setTimeout(() => setSuccessNotice(null), 3000);
      loadTenantDetails(selectedTenantSlug);
    } catch (err: any) {
      setErrorNotice(err?.detail || 'Failed to add staff member.');
    } finally {
      setIsAddingStaff(false);
    }
  };

  // Filtered requests computation
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (!requestSearchQuery.trim()) return true;
      const q = requestSearchQuery.toLowerCase();
      const orgName = (r.organization_name || r.organization?.name || '').toLowerCase();
      const email = (r.organization?.official_email || '').toLowerCase();
      const intended = (r.intended_use || '').toLowerCase();
      const reqId = r.id.toLowerCase();
      return orgName.includes(q) || email.includes(q) || intended.includes(q) || reqId.includes(q);
    });
  }, [requests, requestSearchQuery]);

  // Priority Pending Requests for Overview
  const pendingQueue = useMemo(() => {
    return requests.filter(r => ['pending_review', 'submitted', 'under_review'].includes(r.status));
  }, [requests]);

  // Status helper badge
  const renderStatusBadge = (st: string) => {
    switch (st) {
      case 'active':
      case 'provisioned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-[#1C3A13]/10 text-[#1C3A13] border border-[#1C3A13]/30">
            <CheckCircle2 className="w-3 h-3 text-[#1C3A13]" />
            ACTIVE
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-300">
            <Check className="w-3 h-3" />
            APPROVED
          </span>
        );
      case 'provisioning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-purple-50 text-purple-800 border border-purple-300 animate-pulse">
            <Sparkles className="w-3 h-3 text-purple-600" />
            PROVISIONING
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-blue-50 text-blue-800 border border-blue-300">
            <Clock className="w-3 h-3" />
            UNDER REVIEW
          </span>
        );
      case 'changes_requested':
      case 'more_info_required':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3 h-3" />
            CHANGES REQUESTED
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-rose-50 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3 h-3" />
            REJECTED
          </span>
        );
      case 'pending_review':
      case 'submitted':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-amber-50 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3" />
            PENDING REVIEW
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Global Toast / Banner Notices */}
      {errorNotice && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="font-sans font-medium">{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice(null)} className="text-rose-500 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span className="font-sans font-medium">{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action / Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DAD4C8]">
        <div>
          <h1 className="font-serif text-3xl text-[#2F302B] tracking-tight">
            {activeTab === 'overview' && 'Platform Governance Overview'}
            {activeTab === 'requests' && 'Institutional Request Review Queue'}
            {activeTab === 'institutions' && 'Verified Institutions Directory'}
            {activeTab === 'workspaces' && 'Multi-Tenant Workspace Management'}
            {activeTab === 'staff' && 'Admin & Staff Access Control'}
            {activeTab === 'audit' && 'Immutable Decision Audit Trail'}
          </h1>
          <p className="text-xs text-[#6F6D63] font-sans mt-0.5">
            Secure Platform Super Admin console · End-to-end verification, tenant provisioning, and ethical compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-full text-xs flex items-center gap-1.5 border-[#DAD4C8] hover:bg-[#EEEEE9]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="default" padding="md" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] space-y-2">
              <div className="flex items-center justify-between text-[#6F6D63]">
                <span className="text-[11px] font-mono uppercase tracking-wider">Pending Review</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="font-serif text-3xl text-[#2F302B]">
                {requests.filter(r => ['pending_review', 'submitted'].includes(r.status)).length}
              </div>
              <div className="text-[11px] text-[#6F6D63]">Requires initial platform intake</div>
            </Card>

            <Card variant="default" padding="md" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] space-y-2">
              <div className="flex items-center justify-between text-[#6F6D63]">
                <span className="text-[11px] font-mono uppercase tracking-wider">Under Review</span>
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <div className="font-serif text-3xl text-[#2F302B]">
                {requests.filter(r => r.status === 'under_review').length}
              </div>
              <div className="text-[11px] text-[#6F6D63]">Assigned to active reviewers</div>
            </Card>

            <Card variant="default" padding="md" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] space-y-2">
              <div className="flex items-center justify-between text-[#6F6D63]">
                <span className="text-[11px] font-mono uppercase tracking-wider">Active Workspaces</span>
                <Layers className="w-4 h-4 text-[#1C3A13]" />
              </div>
              <div className="font-serif text-3xl text-[#1C3A13]">
                {requests.filter(r => ['active', 'provisioned'].includes(r.status)).length}
              </div>
              <div className="text-[11px] text-[#6F6D63]">Live campus screening environments</div>
            </Card>

            <Card variant="default" padding="md" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] space-y-2">
              <div className="flex items-center justify-between text-[#6F6D63]">
                <span className="text-[11px] font-mono uppercase tracking-wider">Registered Orgs</span>
                <Building2 className="w-4 h-4 text-[#2F302B]" />
              </div>
              <div className="font-serif text-3xl text-[#2F302B]">
                {organizations.length}
              </div>
              <div className="text-[11px] text-[#6F6D63]">Total university & institution accounts</div>
            </Card>
          </div>

          {/* Quick Action Pending Review Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl text-[#2F302B]">Priority Verification Queue</h2>
                <p className="text-xs text-[#6F6D63]">Institutional requests awaiting platform administrator verification.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('requests')}
                className="rounded-full text-xs flex items-center gap-1.5 border-[#DAD4C8]"
              >
                <span>View Full Queue</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>

            {pendingQueue.length === 0 ? (
              <Card variant="default" padding="lg" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] text-center p-8">
                <CheckCircle2 className="w-8 h-8 text-[#1C3A13] mx-auto mb-2 opacity-60" />
                <h4 className="font-serif text-lg text-[#2F302B]">Review Queue Clear</h4>
                <p className="text-xs text-[#6F6D63] max-w-sm mx-auto mt-1">
                  All submitted institutional requests have been reviewed, approved, or responded to.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingQueue.slice(0, 6).map(req => (
                  <Card key={req.id} variant="default" padding="md" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] hover:border-[#1C3A13]/40 transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        {renderStatusBadge(req.status)}
                        <span className="text-[10px] font-mono text-[#6F6D63]">{new Date(req.created_at).toLocaleDateString()}</span>
                      </div>

                      <div>
                        <h3 className="font-serif text-lg text-[#2F302B] font-medium leading-tight">
                          {req.organization_name || req.organization?.name || 'Institution'}
                        </h3>
                        <span className="text-xs text-[#6F6D63] font-mono block mt-0.5">
                          {req.organization?.official_email || 'No email provided'}
                        </span>
                      </div>

                      <div className="text-xs text-[#2F302B] bg-[#FBF9F4] p-3 rounded-2xl border border-[#EEEEE9] space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#6F6D63]">Plan:</span>
                          <span className="font-semibold capitalize">{(req.requested_plan || 'standard').replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#6F6D63]">Scale:</span>
                          <span className="font-mono">{(req.estimated_users || req.expected_participants || 0).toLocaleString()} users</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openRequestDetail(req)}
                      className="w-full rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <span>Review & Verify</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Audit Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl text-[#2F302B]">Recent Platform Decisions</h2>
                <p className="text-xs text-[#6F6D63]">Transparent audit feed of verified status changes and administrator notes.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('audit')}
                className="rounded-full text-xs flex items-center gap-1.5 border-[#DAD4C8]"
              >
                <span>Full Audit Trail</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>

            <Card variant="default" padding="sm" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] overflow-hidden">
              <div className="divide-y divide-[#EEEEE9]">
                {auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#2F302B]">{log.institution_name}</span>
                        <span className="text-[#9A988D]">·</span>
                        <span className="font-mono text-[10px] text-[#6F6D63]">Ref: {log.request_id.substring(0, 8)}</span>
                      </div>
                      <p className="text-xs text-[#6F6D63] font-sans">
                        Transitioned to <span className="font-mono font-semibold text-[#1C3A13]">{log.to_status}</span> by {log.changed_by_name} ({log.changed_by_email}).
                        {log.comments && <span className="italic block text-[#2F302B] mt-0.5">"{log.comments}"</span>}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-[#9A988D] flex-shrink-0">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <div className="p-6 text-center text-xs text-[#6F6D63]">No decision audit entries recorded yet.</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INSTITUTIONAL REQUESTS QUEUE */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls: Search, Filter Tabs, Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FCFCF7] p-4 rounded-3xl border border-[#DAD4C8]">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#77766C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={requestSearchQuery}
                onChange={e => setRequestSearchQuery(e.target.value)}
                placeholder="Search institution name, email, program use, or request ID..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FBF9F4] border border-[#DAD4C8] text-xs text-[#2F302B] placeholder-[#9A988D] focus:outline-none focus:ring-2 focus:ring-[#1C3A13]"
              />
            </div>

            {/* Filter Tabs & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-2xl bg-[#EEEEE9] p-1 text-[11px] font-mono">
                {['all', 'pending', 'under_review', 'changes_requested', 'approved', 'provisioning', 'active', 'rejected'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setRequestStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors capitalize ${
                      requestStatusFilter === tab
                        ? 'bg-[#FCFCF7] text-[#1C3A13] shadow-xs'
                        : 'text-[#6F6D63] hover:text-[#2F302B]'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <select
                value={requestSortBy}
                onChange={e => setRequestSortBy(e.target.value)}
                aria-label="Sort institutional requests"
                className="px-3 py-2 rounded-2xl bg-[#FBF9F4] border border-[#DAD4C8] text-xs text-[#2F302B] font-mono focus:outline-none"
              >
                <option value="priority">Sort: Pending First</option>
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="scale">Sort: User Scale</option>
              </select>
            </div>
          </div>

          {/* Requests Table / Cards */}
          <div className="space-y-3">
            {filteredRequests.map(req => (
              <Card
                key={req.id}
                variant="default"
                padding="md"
                className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] hover:border-[#1C3A13]/50 transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Organization & Plan Info */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs text-[#6F6D63]">Ref: {req.id.substring(0, 8)}</span>
                      {renderStatusBadge(req.status)}
                      {req.assigned_reviewer_name && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EEEEE9] text-[#2F302B]">
                          <UserCheck className="w-3 h-3 text-[#1C3A13]" />
                          Reviewer: {req.assigned_reviewer_name}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl text-[#2F302B] font-medium">
                      {req.organization_name || req.organization?.name || 'Institution'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#6F6D63] font-mono">
                      <span>Email: {req.organization?.official_email || '—'}</span>
                      <span>•</span>
                      <span>Plan: {(req.requested_plan || 'standard').replace('_', ' ')}</span>
                      <span>•</span>
                      <span>Scale: {(req.estimated_users || req.expected_participants || 0).toLocaleString()} users</span>
                      <span>•</span>
                      <span>Slug: {req.custom_subdomain || req.organization?.slug || 'auto'}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRequestDetail(req)}
                      className="rounded-full text-xs font-semibold flex items-center gap-1.5 border-[#DAD4C8]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review & Verification</span>
                    </Button>

                    {['approved', 'provisioning'].includes(req.status) && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedReq(req);
                          setProvisionSlug(req.custom_subdomain || req.organization?.slug || `univ-${req.id.substring(0, 6)}`);
                          setProvisioningModalOpen(true);
                        }}
                        className="rounded-full text-xs font-semibold flex items-center gap-1.5 bg-[#1C3A13] text-[#FCFCF7]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#D3FA99]" />
                        <span>Deploy Workspace</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Intended Use Preview */}
                <div className="text-xs bg-[#FBF9F4] p-3 rounded-2xl border border-[#EEEEE9] text-[#2F302B] font-sans">
                  <span className="font-mono text-[10px] text-[#6F6D63] uppercase block mb-0.5">Campus Program Use:</span>
                  {req.intended_use}
                </div>

                {/* Internal Note indicator if present */}
                {req.internal_notes && (
                  <div className="text-xs bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50 text-amber-900 font-sans flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                    <span className="font-mono text-[10px] uppercase font-semibold">Admin Note:</span>
                    <span className="truncate">{req.internal_notes}</span>
                  </div>
                )}
              </Card>
            ))}

            {filteredRequests.length === 0 && (
              <Card variant="default" padding="lg" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] text-center p-12">
                <Search className="w-8 h-8 text-[#9A988D] mx-auto mb-2" />
                <h4 className="font-serif text-lg text-[#2F302B]">No Matching Requests Found</h4>
                <p className="text-xs text-[#6F6D63] max-w-sm mx-auto mt-1">
                  Try adjusting your search terms or status filter tabs to inspect other requests.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: VERIFIED INSTITUTIONS DIRECTORY */}
      {/* ======================================================== */}
      {activeTab === 'institutions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl text-[#2F302B]">Registered Institutions</h2>
              <p className="text-xs text-[#6F6D63]">Audit institutional credentials, verify domain validity, and manage tenant privileges.</p>
            </div>
            <span className="text-xs font-mono text-[#6F6D63] bg-[#EEEEE9] px-3 py-1.5 rounded-full">
              {organizations.length} Institutions Registered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizations.map(org => (
              <Card key={org.id} variant="default" padding="md" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-[#EEEEE9] pb-3">
                  <div>
                    <h3 className="font-serif text-lg text-[#2F302B] font-semibold">{org.name}</h3>
                    <span className="font-mono text-xs text-[#6F6D63] block">Slug: {org.slug}</span>
                  </div>
                  {renderStatusBadge(org.status || org.account_status || 'pending_verification')}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-sans text-[#2F302B]">
                  <div className="p-2.5 rounded-xl bg-[#FBF9F4] border border-[#EEEEE9]">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Official Email</span>
                    <span className="truncate block font-medium">{org.official_email}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FBF9F4] border border-[#EEEEE9]">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Contact Officer</span>
                    <span className="truncate block font-medium">{org.contact_name || org.contact_person_name || '—'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FBF9F4] border border-[#EEEEE9]">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Phone / Helpline</span>
                    <span className="truncate block font-medium">{org.contact_phone || '—'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FBF9F4] border border-[#EEEEE9]">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Location</span>
                    <span className="truncate block font-medium">{[org.city, org.state, org.country].filter(Boolean).join(', ') || '—'}</span>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#EEEEE9]">
                  <span className="text-[10px] font-mono text-[#6F6D63]">
                    Registered: {new Date(org.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {org.status !== 'active' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateOrgStatus(org.id, 'active')}
                        className="rounded-full text-xs font-semibold bg-[#1C3A13] text-[#FCFCF7]"
                      >
                        Verify & Activate
                      </Button>
                    )}
                    {org.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrgStatus(org.id, 'suspended')}
                        className="rounded-full text-xs text-rose-800 border-rose-300 hover:bg-rose-50"
                      >
                        Suspend Org
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: WORKSPACE MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'workspaces' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl text-[#2F302B]">Multi-Tenant Workspaces</h2>
              <p className="text-xs text-[#6F6D63]">Manage isolated institutional subdomains, custom branding, and staff access.</p>
            </div>

            {/* Tenant Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#6F6D63]">Select Workspace:</span>
              <select
                value={selectedTenantSlug}
                onChange={e => setSelectedTenantSlug(e.target.value)}
                aria-label="Select workspace tenant"
                className="px-3 py-2 rounded-2xl bg-[#FCFCF7] border border-[#DAD4C8] text-xs font-mono font-medium text-[#1C3A13] focus:outline-none"
              >
                {organizations.filter(o => o.status === 'active').map(o => (
                  <option key={o.id} value={o.slug}>{o.name} ({o.slug})</option>
                ))}
              </select>
            </div>
          </div>

          {selectedTenantSlug ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Workspace Overview & Launch Card */}
              <Card variant="default" padding="lg" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#1C3A13] font-semibold uppercase mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Tenant Workspace
                  </div>
                  <h3 className="font-serif text-2xl text-[#2F302B]">
                    {tenantConfig?.name || selectedTenantSlug}
                  </h3>
                  <span className="font-mono text-xs text-[#6F6D63]">
                    Subdomain / Slug: <span className="text-[#1C3A13] font-semibold">{selectedTenantSlug}</span>
                  </span>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9] space-y-1">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Dedicated Portal URL</span>
                    <a
                      href={`/screening?tenant=${selectedTenantSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#1C3A13] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>/screening?tenant={selectedTenantSlug}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9] space-y-1">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Portal Support Email</span>
                    <span className="font-medium text-[#2F302B]">{tenantConfig?.branding?.support_email || 'Not configured'}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9] space-y-1">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Active Campaigns</span>
                    <span className="font-medium text-[#2F302B]">{tenantConfig?.campaigns?.length || 0} Scheduled / Published</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setEditBrandingOpen(true)}
                    className="w-full rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 bg-[#1C3A13] text-[#FCFCF7]"
                  >
                    <Palette className="w-4 h-4" />
                    <span>Customize Branding & Styling</span>
                  </Button>

                  <a
                    href={`/screening?tenant=${selectedTenantSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-2xl text-xs font-semibold text-center border border-[#DAD4C8] hover:bg-[#EEEEE9] text-[#2F302B] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Launch Student Sanctuary</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </Card>

              {/* Branding Preview */}
              <Card variant="default" padding="lg" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] space-y-5 lg:col-span-2">
                <div className="flex items-center justify-between border-b border-[#EEEEE9] pb-3">
                  <div>
                    <h3 className="font-serif text-xl text-[#2F302B]">Branding & Theme Preview</h3>
                    <p className="text-xs text-[#6F6D63]">Institutional visual identity applied across screening instruments.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: brandingPrimary }} />
                    <span className="w-4 h-4 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: brandingAccent }} />
                  </div>
                </div>

                <div
                  className="p-6 rounded-3xl space-y-4 border text-[#FCFCF7]"
                  style={{ backgroundColor: brandingPrimary }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xl font-bold tracking-tight">{brandingTitle || tenantConfig?.name}</span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ backgroundColor: brandingAccent, color: '#1C3A13' }}>
                      Verified Partner
                    </span>
                  </div>
                  <p className="text-xs font-sans leading-relaxed opacity-90 max-w-md">
                    {brandingWelcome || 'Welcome to your dedicated student emotional wellbeing sanctuary. Confidential, clinically validated screening.'}
                  </p>
                  <div className="pt-2 flex items-center gap-4 text-xs font-mono opacity-80">
                    <span>Help: {brandingEmail || 'support@institution.ac.in'}</span>
                    <span>•</span>
                    <span>Helpline: {brandingPhone || '14416'}</span>
                  </div>
                </div>

                {/* Staff summary in this tenant */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-lg text-[#2F302B]">Institutional Counsellors & Admins ({tenantStaff.length})</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddStaffModal(true)}
                      className="rounded-full text-xs flex items-center gap-1 border-[#DAD4C8]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Staff</span>
                    </Button>
                  </div>

                  <div className="divide-y divide-[#EEEEE9] border border-[#EEEEE9] rounded-2xl overflow-hidden">
                    {tenantStaff.map(s => (
                      <div key={s.membership_id || s.user_id} className="p-3 bg-[#FBF9F4] flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="font-medium text-[#2F302B]">{s.email}</span>
                          <span className="text-[10px] font-mono text-[#6F6D63] block capitalize">Role: {s.role.replace('_', ' ')}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Active
                        </span>
                      </div>
                    ))}
                    {tenantStaff.length === 0 && (
                      <div className="p-4 text-center text-xs text-[#6F6D63]">No institutional staff added to this tenant yet.</div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card variant="default" padding="lg" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] text-center p-12">
              <Layers className="w-8 h-8 text-[#9A988D] mx-auto mb-2" />
              <h4 className="font-serif text-lg text-[#2F302B]">No Active Workspaces Found</h4>
              <p className="text-xs text-[#6F6D63] max-w-sm mx-auto mt-1">
                Approve and deploy an institutional workspace request to establish a multi-tenant portal.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: ADMIN & STAFF ACCESS */}
      {/* ======================================================== */}
      {activeTab === 'staff' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl text-[#2F302B]">Platform Super Administrators & Reviewers</h2>
              <p className="text-xs text-[#6F6D63]">Authorized personnel privileged to verify institutional requests and manage tenant deployments.</p>
            </div>
            <span className="text-xs font-mono text-[#1C3A13] bg-[#1C3A13]/10 px-3 py-1.5 rounded-full border border-[#1C3A13]/20 font-semibold">
              {reviewers.length} Active Platform Admins
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewers.map(rev => (
              <Card key={rev.id} variant="default" padding="md" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#1C3A13] text-[#FCFCF7] flex items-center justify-center font-serif font-bold text-sm">
                    {rev.name ? rev.name.substring(0, 2).toUpperCase() : 'PA'}
                  </div>
                  <div>
                    <h4 className="font-serif text-base text-[#2F302B] font-semibold">{rev.name}</h4>
                    <span className="text-xs text-[#6F6D63] font-mono">{rev.email}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EEEEE9] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#6F6D63]">Role:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1C3A13]/10 text-[#1C3A13] font-semibold text-[10px] uppercase">
                    {rev.role}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: DECISION AUDIT LOGS */}
      {/* ======================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl text-[#2F302B]">Immutable Decision Audit Trail</h2>
              <p className="text-xs text-[#6F6D63]">Chronological record of every institutional review, reviewer assignment, and deployment action.</p>
            </div>
            <span className="text-xs font-mono text-[#6F6D63] bg-[#EEEEE9] px-3 py-1.5 rounded-full">
              {auditLogs.length} Total Transition Events
            </span>
          </div>

          <Card variant="default" padding="sm" className="rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#FBF9F4] border-b border-[#DAD4C8] font-mono text-[10px] text-[#6F6D63] uppercase">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Institution / Request ID</th>
                    <th className="px-4 py-3">Transition</th>
                    <th className="px-4 py-3">Admin / Reviewer</th>
                    <th className="px-4 py-3">Decision Reason & Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEE9]">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#FBF9F4]/60 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-[11px] text-[#9A988D] whitespace-nowrap">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-[#2F302B] block">{log.institution_name}</span>
                        <span className="font-mono text-[10px] text-[#6F6D63]">Ref: {log.request_id.substring(0, 8)}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {log.from_status && (
                            <>
                              <span className="font-mono text-[10px] text-[#9A988D]">{log.from_status}</span>
                              <span className="text-[#9A988D]">→</span>
                            </>
                          )}
                          <span className="font-mono font-semibold text-[#1C3A13]">{log.to_status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#2F302B]">
                        {log.changed_by_name}
                        <span className="text-[10px] text-[#6F6D63] block">{log.changed_by_email}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#6F6D63]">
                        {log.comments ? (
                          <span className="italic text-[#2F302B]">"{log.comments}"</span>
                        ) : (
                          <span className="text-[#9A988D]">Standard lifecycle transition</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-[#6F6D63]">
                        No audit events recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* REQUEST DETAIL & VERIFICATION MODAL */}
      {/* ======================================================== */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="max-w-4xl w-full bg-[#FCFCF7] border border-[#DAD4C8] rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#DAD4C8] flex items-center justify-between bg-[#FBF9F4]">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs text-[#6F6D63]">Request Ref: {selectedReq.id}</span>
                  {renderStatusBadge(selectedReq.status)}
                </div>
                <h3 className="font-serif text-2xl text-[#2F302B]">
                  {selectedReq.organization_name || selectedReq.organization?.name || 'Institutional Verification'}
                </h3>
              </div>

              <button
                onClick={closeRequestDetail}
                className="w-8 h-8 rounded-full bg-[#EEEEE9] text-[#6F6D63] hover:text-[#2F302B] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs font-sans">
              {/* SECTION 1: Registered Institution Details */}
              <div className="space-y-3">
                <h4 className="font-serif text-lg text-[#2F302B] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1C3A13]" />
                  <span>1. Registered Institution Credentials</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9]">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Official Email</span>
                    <span className="font-mono font-medium text-[#1C3A13]">{selectedReq.organization?.official_email || '—'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9]">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Authorized Officer</span>
                    <span className="font-medium text-[#2F302B]">{selectedReq.organization?.contact_name || selectedReq.organization?.contact_person_name || '—'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9]">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Designation</span>
                    <span className="font-medium text-[#2F302B]">{selectedReq.organization?.contact_person_designation || 'Institutional Lead'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9]">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Helpline / Phone</span>
                    <span className="font-medium text-[#2F302B]">{selectedReq.organization?.contact_phone || '—'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9]">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Website</span>
                    <span className="font-mono font-medium text-[#2F302B]">{selectedReq.organization?.website || '—'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9]">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Campus Location</span>
                    <span className="font-medium text-[#2F302B]">
                      {[selectedReq.organization?.city, selectedReq.organization?.state, selectedReq.organization?.country].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Workspace Requirements */}
              <div className="space-y-3">
                <h4 className="font-serif text-lg text-[#2F302B] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1C3A13]" />
                  <span>2. Workspace Requirements & Scope</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9]">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Requested Plan</span>
                    <span className="font-medium capitalize text-[#2F302B]">{(selectedReq.requested_plan || 'standard').replace('_', ' ')} Plan</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9]">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Estimated Users</span>
                    <span className="font-serif text-base font-semibold text-[#1C3A13]">
                      {(selectedReq.estimated_users || selectedReq.expected_participants || 0).toLocaleString()} Students
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9]">
                    <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Preferred Subdomain</span>
                    <span className="font-mono font-semibold text-[#1C3A13]">{selectedReq.custom_subdomain || selectedReq.organization?.slug || 'auto'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#6F6D63] block">Intended Campus / Program Use</span>
                  <p className="text-xs text-[#2F302B] leading-relaxed">{selectedReq.intended_use}</p>
                </div>

                {selectedReq.additional_requirements && (
                  <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#EEEEE9] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#6F6D63] block">Technical Notes & IRB Protocols</span>
                    <p className="text-xs text-[#2F302B] leading-relaxed">{selectedReq.additional_requirements}</p>
                  </div>
                )}
              </div>

              {/* SECTION 3: Platform Verification Checklist */}
              <div className="space-y-3 p-5 rounded-2xl bg-[#EEEEE9]/50 border border-[#DAD4C8]">
                <h4 className="font-serif text-lg text-[#2F302B] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1C3A13]" />
                  <span>3. Platform Verification Checklist</span>
                </h4>
                <p className="text-[11px] text-[#6F6D63]">
                  Verify each institutional criterion prior to granting approval. Checked items reflect administrative due diligence.
                </p>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.domainVerified}
                      onChange={e => setChecklist(prev => ({ ...prev, domainVerified: e.target.checked }))}
                      className="rounded text-[#1C3A13] focus:ring-[#1C3A13]"
                    />
                    <span>Official academic / healthcare domain confirmed ({selectedReq.organization?.official_email || 'email'})</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.repConfirmed}
                      onChange={e => setChecklist(prev => ({ ...prev, repConfirmed: e.target.checked }))}
                      className="rounded text-[#1C3A13] focus:ring-[#1C3A13]"
                    />
                    <span>Authorized institutional representative and designation confirmed</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.scaleValidated}
                      onChange={e => setChecklist(prev => ({ ...prev, scaleValidated: e.target.checked }))}
                      className="rounded text-[#1C3A13] focus:ring-[#1C3A13]"
                    />
                    <span>Expected student population and screening scope aligned with requested plan</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.complianceChecked}
                      onChange={e => setChecklist(prev => ({ ...prev, complianceChecked: e.target.checked }))}
                      className="rounded text-[#1C3A13] focus:ring-[#1C3A13]"
                    />
                    <span>Ethical data governance and strict k ≥ 5 cohort suppression acknowledged</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.subdomainChecked}
                      onChange={e => setChecklist(prev => ({ ...prev, subdomainChecked: e.target.checked }))}
                      className="rounded text-[#1C3A13] focus:ring-[#1C3A13]"
                    />
                    <span>Preferred subdomain availability confirmed and conflict-free</span>
                  </label>
                </div>
              </div>

              {/* SECTION 4: Reviewer Assignment & Internal Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Reviewer Assignment */}
                <div className="p-4 rounded-2xl bg-[#FCFCF7] border border-[#DAD4C8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#6F6D63] uppercase font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#1C3A13]" />
                      Assigned Reviewer
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAssignReviewer}
                      disabled={assigningReviewer}
                      className="rounded-full text-[10px] py-1 px-3 border-[#DAD4C8]"
                    >
                      {assigningReviewer ? 'Saving...' : 'Update Reviewer'}
                    </Button>
                  </div>

                  <select
                    value={assignedReviewerId}
                    onChange={e => setAssignedReviewerId(e.target.value)}
                    aria-label="Assign platform reviewer"
                    className="w-full px-3 py-2 rounded-xl bg-[#FBF9F4] border border-[#DAD4C8] text-xs font-mono text-[#2F302B] focus:outline-none"
                  >
                    <option value="">-- Unassigned --</option>
                    {reviewers.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
                    ))}
                  </select>
                </div>

                {/* Internal Notes (Admin-Private) */}
                <div className="p-4 rounded-2xl bg-[#FCFCF7] border border-[#DAD4C8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#6F6D63] uppercase font-semibold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      Internal Notes (Admin Private)
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveInternalNotes}
                      disabled={savingNotes}
                      className="rounded-full text-[10px] py-1 px-3 border-[#DAD4C8]"
                    >
                      {savingNotes ? 'Saving...' : 'Save Note'}
                    </Button>
                  </div>

                  <textarea
                    rows={2}
                    value={internalNotesInput}
                    onChange={e => setInternalNotesInput(e.target.value)}
                    placeholder="Private verification observations, compliance checks, or accreditation details (never shown to institutions)..."
                    className="w-full px-3 py-2 rounded-xl bg-[#FBF9F4] border border-[#DAD4C8] text-xs text-[#2F302B] focus:outline-none focus:ring-1 focus:ring-[#1C3A13]"
                  />
                </div>
              </div>

              {/* SECTION 5: Audit History */}
              {selectedReq.history && selectedReq.history.length > 0 && (
                <div className="space-y-2 border-t border-[#EEEEE9] pt-4">
                  <span className="text-[10px] font-mono text-[#6F6D63] uppercase block">Decision & Lifecycle History</span>
                  <div className="space-y-1.5">
                    {selectedReq.history.map(h => (
                      <div key={h.id} className="text-xs text-[#6F6D63] flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] text-[#9A988D]">{new Date(h.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span className="font-medium text-[#2F302B]">Status changed to <span className="font-mono text-[#1C3A13]">{h.new_status}</span></span>
                        {h.reason_or_notes && <span className="italic">("{h.reason_or_notes}")</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / Lifecycle Action Bar */}
            <div className="p-6 border-t border-[#DAD4C8] bg-[#FBF9F4] flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={closeRequestDetail}
                className="rounded-full text-xs border-[#DAD4C8]"
              >
                Close View
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Mark Under Review */}
                {['submitted', 'pending_review'].includes(selectedReq.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkUnderReview}
                    className="rounded-full text-xs font-semibold border-blue-300 text-blue-800 hover:bg-blue-50"
                  >
                    Mark Under Review
                  </Button>
                )}

                {/* 2. Request Changes */}
                {!['rejected', 'active', 'provisioned'].includes(selectedReq.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDecisionModalMode('changes');
                      setDecisionReasonText('');
                    }}
                    className="rounded-full text-xs font-semibold border-amber-300 text-amber-800 hover:bg-amber-50"
                  >
                    Request Changes / More Info
                  </Button>
                )}

                {/* 3. Reject Request */}
                {!['rejected', 'active', 'provisioned'].includes(selectedReq.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDecisionModalMode('reject');
                      setDecisionReasonText('');
                    }}
                    className="rounded-full text-xs font-semibold border-rose-300 text-rose-800 hover:bg-rose-50"
                  >
                    Reject Request
                  </Button>
                )}

                {/* 4. Approve Request */}
                {['pending_review', 'submitted', 'under_review', 'changes_requested', 'more_info_required'].includes(selectedReq.status) && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApproveRequest}
                    className="rounded-full text-xs font-semibold bg-emerald-800 text-[#FCFCF7] hover:bg-emerald-900"
                  >
                    Approve Request
                  </Button>
                )}

                {/* 5. Start Provisioning */}
                {selectedReq.status === 'approved' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleStartProvisioning}
                    className="rounded-full text-xs font-semibold bg-purple-800 text-[#FCFCF7] hover:bg-purple-900"
                  >
                    Start Provisioning
                  </Button>
                )}

                {/* 6. Deploy & Activate */}
                {['approved', 'provisioning'].includes(selectedReq.status) && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setProvisionSlug(selectedReq.custom_subdomain || selectedReq.organization?.slug || `tenant-${selectedReq.id.substring(0, 6)}`);
                      setProvisioningModalOpen(true);
                    }}
                    className="rounded-full text-xs font-semibold bg-[#1C3A13] text-[#FCFCF7]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D3FA99]" />
                    <span>Deploy & Activate Workspace</span>
                  </Button>
                )}

                {/* 7. Live Link */}
                {['active', 'provisioned'].includes(selectedReq.status) && (
                  <a
                    href={`/screening?tenant=${selectedReq.custom_subdomain || selectedReq.organization?.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-[#1C3A13] text-[#FCFCF7] flex items-center gap-1.5"
                  >
                    <span>Open Live Workspace</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DECISION REASON MODAL (CHANGES REQUESTED OR REJECT) */}
      {/* ======================================================== */}
      {decisionModalMode && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-[#FCFCF7] border border-[#DAD4C8] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="space-y-1">
              <h3 className="font-serif text-2xl text-[#2F302B]">
                {decisionModalMode === 'changes' ? 'Request Changes & Clarification' : 'Reject Institutional Request'}
              </h3>
              <p className="text-xs text-[#6F6D63]">
                {decisionModalMode === 'changes'
                  ? 'Explain what details, verification documents, or scope adjustments the institution must provide.'
                  : 'State the formal grounds for rejection. This reason will be logged in the immutable audit trail and sent to the applicant.'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-[#2F302B] uppercase tracking-wider font-semibold">
                Mandatory Decision Reason / Notes *
              </label>
              <textarea
                required
                rows={4}
                value={decisionReasonText}
                onChange={e => setDecisionReasonText(e.target.value)}
                placeholder={
                  decisionModalMode === 'changes'
                    ? 'e.g. Please clarify your campus crisis team contact number and provide confirmation of institutional IRB protocol...'
                    : 'e.g. Institution email domain could not be verified against accredited university registries...'
                }
                className="w-full px-4 py-3 rounded-2xl bg-[#FBF9F4] border border-[#DAD4C8] text-xs text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13]"
              />
              <span className="text-[10px] text-[#9A988D] font-mono">Minimum 5 characters required</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDecisionModalMode(null)}
                disabled={decisionSubmitting}
                className="rounded-full text-xs border-[#DAD4C8]"
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitDecision}
                disabled={decisionSubmitting || decisionReasonText.trim().length < 5}
                className={`rounded-full text-xs font-semibold ${
                  decisionModalMode === 'reject'
                    ? 'bg-rose-800 text-white hover:bg-rose-900'
                    : 'bg-amber-800 text-white hover:bg-amber-900'
                }`}
              >
                {decisionSubmitting ? 'Submitting...' : decisionModalMode === 'changes' ? 'Send Changes Notice' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DEPLOY WORKSPACE MODAL */}
      {/* ======================================================== */}
      {provisioningModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-[#FCFCF7] border border-[#DAD4C8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[#1C3A13] uppercase font-semibold">
                <Sparkles className="w-4 h-4 text-[#1C3A13]" />
                Infrastructure Provisioning
              </div>
              <h3 className="font-serif text-2xl text-[#2F302B]">
                Deploy Institutional Tenant
              </h3>
              <p className="text-xs text-[#6F6D63]">
                Idempotently creates isolated database tenant records, campus emergency resources, and custom branding.
              </p>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[11px] font-mono text-[#2F302B] uppercase tracking-wider mb-1">
                  Tenant Subdomain Slug *
                </label>
                <input
                  type="text"
                  value={provisionSlug}
                  onChange={e => setProvisionSlug(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF9F4] border border-[#DAD4C8] text-xs font-mono text-[#1C3A13] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3A13]"
                />
                <span className="text-[10px] text-[#9A988D] font-mono">Will be reachable at /screening?tenant={provisionSlug}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#2F302B] uppercase tracking-wider mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={provisionPrimaryColor}
                      onChange={e => setProvisionPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[#DAD4C8]"
                    />
                    <input
                      type="text"
                      value={provisionPrimaryColor}
                      onChange={e => setProvisionPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#FBF9F4] border border-[#DAD4C8] font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#2F302B] uppercase tracking-wider mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={provisionAccentColor}
                      onChange={e => setProvisionAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[#DAD4C8]"
                    />
                    <input
                      type="text"
                      value={provisionAccentColor}
                      onChange={e => setProvisionAccentColor(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#FBF9F4] border border-[#DAD4C8] font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProvisioningModalOpen(false)}
                disabled={isProvisioning}
                className="rounded-full text-xs border-[#DAD4C8]"
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleProvisionWorkspace}
                disabled={isProvisioning || !provisionSlug.trim()}
                className="rounded-full text-xs font-semibold bg-[#1C3A13] text-[#FCFCF7] flex items-center gap-1.5"
              >
                {isProvisioning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Provisioning Workspace...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#D3FA99]" />
                    <span>Deploy & Activate</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BRANDING CUSTOMIZATION MODAL */}
      {/* ======================================================== */}
      {editBrandingOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-[#FCFCF7] border border-[#DAD4C8] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="space-y-1">
              <h3 className="font-serif text-2xl text-[#2F302B]">Customize Workspace Branding</h3>
              <p className="text-xs text-[#6F6D63]">Tenant: {selectedTenantSlug}</p>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[11px] font-mono text-[#2F302B] uppercase tracking-wider mb-1">
                  Portal Title
                </label>
                <input
                  type="text"
                  value={brandingTitle}
                  onChange={e => setBrandingTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FBF9F4] border border-[#DAD4C8] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#2F302B] uppercase tracking-wider mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={brandingEmail}
                    onChange={e => setBrandingEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FBF9F4] border border-[#DAD4C8] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#2F302B] uppercase tracking-wider mb-1">
                    Support Phone
                  </label>
                  <input
                    type="text"
                    value={brandingPhone}
                    onChange={e => setBrandingPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FBF9F4] border border-[#DAD4C8] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#2F302B] uppercase tracking-wider mb-1">
                  Custom Welcome Text
                </label>
                <textarea
                  rows={2}
                  value={brandingWelcome}
                  onChange={e => setBrandingWelcome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FBF9F4] border border-[#DAD4C8] text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditBrandingOpen(false)}
                disabled={isSavingBranding}
                className="rounded-full text-xs border-[#DAD4C8]"
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveBranding}
                disabled={isSavingBranding}
                className="rounded-full text-xs font-semibold bg-[#1C3A13] text-[#FCFCF7]"
              >
                {isSavingBranding ? 'Saving...' : 'Save Branding'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD STAFF MODAL */}
      {/* ======================================================== */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-[#FCFCF7] border border-[#DAD4C8] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="space-y-1">
              <h3 className="font-serif text-2xl text-[#2F302B]">Add Institutional Staff</h3>
              <p className="text-xs text-[#6F6D63]">Create counsellor or admin credentials for tenant: {selectedTenantSlug}</p>
            </div>

            <form onSubmit={handleAddStaffMember} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[11px] font-mono text-[#2F302B] uppercase tracking-wider mb-1">
                  Staff Email *
                </label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={e => setNewStaffEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FBF9F4] border border-[#DAD4C8] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#2F302B] uppercase tracking-wider mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  value={newStaffPassword}
                  onChange={e => setNewStaffPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FBF9F4] border border-[#DAD4C8] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#2F302B] uppercase tracking-wider mb-1">
                  Staff Role *
                </label>
                <select
                  value={newStaffRole}
                  onChange={e => setNewStaffRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FBF9F4] border border-[#DAD4C8] text-xs font-mono"
                >
                  <option value="counsellor">Counsellor (Clinical Access)</option>
                  <option value="institution_admin">Institution Admin (Workspace Governance)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  disabled={isAddingStaff}
                  className="rounded-full text-xs border-[#DAD4C8]"
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isAddingStaff}
                  className="rounded-full text-xs font-semibold bg-[#1C3A13] text-[#FCFCF7]"
                >
                  {isAddingStaff ? 'Adding Staff...' : 'Add Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
