import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  UserCheck,
  Search,
  Filter,
  FileText,
  Lock,
  HeartHandshake,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';
import {
  fetchCounsellingCases,
  updateCounsellingCase,
  type CounsellingCaseItem,
} from '../lib/api';

export const CounsellorPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isCounsellor = hasRole('counsellor', 'institution_admin', 'platform_admin', 'admin');

  const [tenantSlug, setTenantSlug] = useState<string>(user?.tenantSlug || 'demo-univ');
  const [cases, setCases] = useState<CounsellingCaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Filters
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get('status') || 'all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>(() => searchParams.get('urgency') || 'all');

  useEffect(() => {
    const s = searchParams.get('status') || 'all';
    const u = searchParams.get('urgency') || 'all';
    setStatusFilter(s);
    setUrgencyFilter(u);
  }, [searchParams]);

  // Selected Case for Modal / Details
  const [selectedCase, setSelectedCase] = useState<CounsellingCaseItem | null>(null);
  const [editStatus, setEditStatus] = useState<string>('pending');
  const [editNotes, setEditNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Load cases
  const loadCases = async (slug: string) => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const data = await fetchCounsellingCases(slug);
      setCases(data);
    } catch (err: any) {
      console.error('Failed to load counselling cases:', err);
      setErrorNotice(err?.detail || err?.message || 'Failed to fetch counselling case roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantSlug) {
      loadCases(tenantSlug);
    }
  }, [tenantSlug]);

  // Open edit modal
  const openCaseModal = (item: CounsellingCaseItem) => {
    setSelectedCase(item);
    setEditStatus(item.status);
    setEditNotes(item.counsellor_notes || '');
  };

  // Close modal
  const closeCaseModal = () => {
    setSelectedCase(null);
  };

  // Save case update
  const handleSaveCaseUpdate = async () => {
    if (!selectedCase) return;
    setIsUpdating(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const updated = await updateCounsellingCase(tenantSlug, selectedCase.id, {
        status: editStatus,
        counsellor_notes: editNotes,
        assigned_counsellor_id: user?.userId,
      });

      setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedCase(updated);
      setSuccessNotice(`Case #${updated.id.slice(0, 8)} updated successfully to "${editStatus}".`);
      setTimeout(() => setSuccessNotice(null), 4000);
      closeCaseModal();
    } catch (err: any) {
      setErrorNotice(err?.detail || err?.message || 'Failed to update case.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filtered cases
  const filteredCases = cases.filter((item) => {
    // Status filter
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }
    // Urgency filter
    if (urgencyFilter !== 'all' && item.urgency_level !== urgencyFilter) {
      return false;
    }
    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = item.student_name.toLowerCase().includes(q);
      const matchEmail = item.student_email.toLowerCase().includes(q);
      const matchNotes = item.notes?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchNotes) {
        return false;
      }
    }
    return true;
  });

  // KPI calculations
  const totalCount = cases.length;
  const pendingCount = cases.filter((c) => c.status === 'pending').length;
  const immediateCount = cases.filter((c) => c.urgency_level === 'immediate_support').length;
  const priorityCount = cases.filter((c) => c.urgency_level === 'priority').length;
  const completedCount = cases.filter((c) => c.status === 'completed').length;

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-beige pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-deep-sage animate-pulse-gentle" />
              <span className="w-2 h-2 rounded-full bg-forest animate-pulse-gentle" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-earth-muted">
                Campus Mental Health Support
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-earth">
              Counsellor Triage & Case Review
            </h1>
            <p className="text-sm text-earth-muted mt-1">
              Authorized clinical triage portal for student self-referrals and voluntary support coordination.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-stone px-3.5 py-1.5 rounded-full border border-border">
              <span className="text-xs text-earth-muted font-mono">Workspace:</span>
              <input
                type="text"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                className="bg-transparent font-mono text-xs font-bold text-forest border-b border-forest/40 focus:outline-none w-28"
                title="Enter Tenant Slug"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadCases(tenantSlug)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Notices */}
        {errorNotice && (
          <div className="p-4 rounded-2xl bg-[#536044]/10 border border-[#536044]/30 text-earth text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#536044] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold text-[#1C3A13] font-mono">Notice: </strong>
              <span>{errorNotice}</span>
            </div>
          </div>
        )}

        {successNotice && (
          <div className="p-4 rounded-2xl bg-forest/10 border border-forest/30 text-earth text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successNotice}</div>
          </div>
        )}

        {/* Clinical Protocol Notice */}
        <div className="p-3.5 rounded-2xl bg-stone/70 border border-border/70 flex items-center gap-3 text-xs text-earth-muted">
          <ShieldCheck className="w-4 h-4 text-forest flex-shrink-0" />
          <p className="leading-relaxed">
            <strong className="text-earth font-mono">Voluntary Referrals:</strong> Cases in this queue represent voluntary student self-referrals with affirmative outreach consent. Standard screening remains anonymous.
          </p>
        </div>

        {/* Role Check Warning (If not logged in as counsellor) */}
        {!isCounsellor && (
          <div className="p-4.5 rounded-2xl bg-marigold/10 border border-marigold/30 text-earth text-xs flex items-start gap-3">
            <Lock className="w-4 h-4 text-marigold-dark flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-earth font-semibold">Counsellor Authentication Required:</strong>
              <p className="leading-relaxed text-earth-muted">
                You are currently viewing this view in preview mode. To triage requests, update case status, or log clinical notes, sign in with your institutional counsellor credentials.
              </p>
            </div>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card variant="default" padding="md" className="border-border bg-snow rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-earth-muted">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">Total Referrals</span>
              <Users className="w-4 h-4 text-forest" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif text-earth">{totalCount}</div>
            <p className="text-[11px] text-earth-muted">Self-referred student cases</p>
          </Card>

          <Card variant="default" padding="md" className="border-border bg-snow rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-earth-muted">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">Pending Triage</span>
              <Clock className="w-4 h-4 text-[#536044]" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif text-[#1C3A13]">{pendingCount}</div>
            <p className="text-[11px] text-earth-muted">Awaiting counsellor review</p>
          </Card>

          <Card variant="default" padding="md" className="border-border bg-snow rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-earth-muted">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">Urgent Support</span>
              <AlertCircle className="w-4 h-4 text-[#536044]" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif text-[#1C3A13]">
              {immediateCount + priorityCount}
            </div>
            <p className="text-[11px] text-muted-earth">{immediateCount} immediate · {priorityCount} priority</p>
          </Card>

          <Card variant="bento" padding="md" className="border-beige bg-surface-raised space-y-2">
            <div className="flex items-center justify-between text-muted-earth">
              <span className="text-xs font-semibold uppercase tracking-wider">Contacted / Done</span>
              <CheckCircle2 className="w-4 h-4 text-deep-sage" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-deep-sage">{completedCount}</div>
            <p className="text-[11px] text-muted-earth">Support completed</p>
          </Card>
        </div>

        {/* Filters & Search Toolbar */}
        <Card variant="bento" padding="md" className="border-beige bg-surface-raised space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-earth" />
              <input
                type="text"
                placeholder="Search by student name, email, or concerns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-sand/40 border border-beige rounded-xl focus:outline-none focus:border-deep-sage text-earth"
              />
            </div>

            {/* Filter selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-earth">
                <Filter className="w-3.5 h-3.5 text-deep-sage" />
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-sand/60 border border-beige rounded-lg px-2 py-1 text-xs text-earth focus:outline-none focus:border-deep-sage"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="contacted">Contacted</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-earth">
                <span>Urgency:</span>
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="bg-sand/60 border border-beige rounded-lg px-2 py-1 text-xs text-earth focus:outline-none focus:border-deep-sage"
                >
                  <option value="all">All Urgencies</option>
                  <option value="immediate_support">Immediate Support</option>
                  <option value="priority">Priority</option>
                  <option value="standard">Standard</option>
                </select>
              </div>

              {(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    urgencyFilter !== 'all' && setUrgencyFilter('all');
                  }}
                  className="text-xs text-deep-sage hover:underline px-1.5 py-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Triage Case Table */}
        <Card variant="bento" padding="none" className="border-beige bg-surface-raised overflow-hidden shadow-organic">
          <div className="px-5 py-4 border-b border-beige flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-deep-sage" />
              <h3 className="font-serif font-bold text-base text-earth">
                Student Referral Triage Queue ({filteredCases.length})
              </h3>
            </div>
            <span className="text-xs text-muted-earth">
              Tenant: <strong className="text-deep-sage font-mono">{tenantSlug}</strong>
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-muted-earth text-sm">
              <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-3 text-deep-sage" />
              Loading student referral queue...
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-12 text-center text-muted-earth space-y-2">
              <p className="font-serif text-base text-earth">No counselling referrals found</p>
              <p className="text-xs">
                {cases.length === 0
                  ? 'No students have submitted outreach requests in this workspace yet.'
                  : 'No cases match your active search and filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sand/30 border-b border-beige text-[11px] font-semibold text-muted-earth uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Urgency</th>
                    <th className="py-3 px-4">Preferred Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige text-xs text-earth">
                  {filteredCases.map((item) => {
                    const isImmediate = item.urgency_level === 'immediate_support';
                    const isPriority = item.urgency_level === 'priority';
                    const isPending = item.status === 'pending';

                    return (
                      <tr key={item.id} className="hover:bg-sand/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-earth">{item.student_name}</div>
                          <div className="text-[11px] text-muted-earth font-mono">{item.student_email}</div>
                          {item.student_phone && (
                            <div className="text-[11px] text-muted-earth">{item.student_phone}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {isImmediate ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-crimson/15 text-crimson border border-crimson/30">
                              <AlertCircle className="w-3 h-3" />
                              Immediate
                            </span>
                          ) : isPriority ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#536044]/15 text-[#1C3A13] border border-[#536044]/30">
                              <Clock className="w-3 h-3 text-[#536044]" />
                              Priority
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-sand text-deep-sage border border-beige">
                              Standard
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 capitalize">
                          <span className="inline-flex items-center gap-1.5 text-muted-earth">
                            {item.preferred_contact_method === 'phone' ? (
                              <Phone className="w-3 h-3 text-deep-sage" />
                            ) : item.preferred_contact_method === 'in_person' ? (
                              <Users className="w-3 h-3 text-deep-sage" />
                            ) : (
                              <Mail className="w-3 h-3 text-deep-sage" />
                            )}
                            {item.preferred_contact_method.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                              item.status === 'pending'
                                ? 'bg-[#536044]/15 text-[#1C3A13] border border-[#536044]/20'
                                : item.status === 'assigned'
                                ? 'bg-amber-500/15 text-amber-800 border border-amber-500/20'
                                : item.status === 'contacted'
                                ? 'bg-deep-sage/15 text-deep-sage border border-deep-sage/20'
                                : item.status === 'completed'
                                ? 'bg-emerald-600/15 text-emerald-800 border border-emerald-600/20'
                                : 'bg-sand text-muted-earth'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-muted-earth text-[11px]">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant={isImmediate || isPending ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => openCaseModal(item)}
                          >
                            Review & Note
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Emergency Helplines & Crisis Protocol Box */}
        <Card variant="bento" padding="lg" className="border-beige bg-surface-raised space-y-4">
          <div className="flex items-center gap-2 text-crimson">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-serif font-bold text-lg text-earth">
              Emergency Helplines & Immediate Triage Support
            </h3>
          </div>
          <p className="text-xs text-muted-earth leading-relaxed">
            If a student indicates acute distress, self-harm ideation, or an active crisis, follow the institutional emergency protocol immediately and guide them to 24/7 verified crisis resources:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-sand/60 border border-beige space-y-1">
              <div className="text-xs font-bold text-earth">Tele-MANAS (Govt of India)</div>
              <div className="text-sm font-mono font-bold text-deep-sage">14416 or 1800-891-4416</div>
              <p className="text-[11px] text-muted-earth">24/7 Toll-free multi-lingual tele-mental health</p>
            </div>

            <div className="p-3.5 rounded-xl bg-sand/60 border border-beige space-y-1">
              <div className="text-xs font-bold text-earth">KIRAN Helpline</div>
              <div className="text-sm font-mono font-bold text-deep-sage">1800-599-0019</div>
              <p className="text-[11px] text-muted-earth">24/7 National mental health helpline</p>
            </div>

            <div className="p-3.5 rounded-xl bg-sand/60 border border-beige space-y-1">
              <div className="text-xs font-bold text-earth">Campus Health Center</div>
              <div className="text-sm font-mono font-bold text-[#1C3A13]">Internal Ext. 2222</div>
              <p className="text-[11px] text-muted-earth">Institutional on-call psychiatric duty</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Case Review & Notes Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-earth/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-ivory border border-beige rounded-3xl max-w-xl w-full shadow-organic overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-beige bg-surface-raised flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-earth font-mono">
                  Case ID #{selectedCase.id.slice(0, 8)}
                </span>
                <h3 className="font-serif font-bold text-xl text-earth">
                  Review Case: {selectedCase.student_name}
                </h3>
              </div>
              <button
                onClick={closeCaseModal}
                className="text-muted-earth hover:text-earth text-lg font-bold p-1"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-earth">
              {/* Student Overview */}
              <div className="p-4 rounded-2xl bg-sand/50 border border-beige space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-earth">Email</span>
                    <div className="font-mono text-xs text-earth flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-deep-sage" />
                      <a href={`mailto:${selectedCase.student_email}`} className="hover:underline text-deep-sage">
                        {selectedCase.student_email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-earth">Phone</span>
                    <div className="font-mono text-xs text-earth flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-deep-sage" />
                      {selectedCase.student_phone ? (
                        <a href={`tel:${selectedCase.student_phone}`} className="hover:underline text-deep-sage">
                          {selectedCase.student_phone}
                        </a>
                      ) : (
                        <span className="text-muted-earth italic">Not provided</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-beige/60 grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-muted-earth">Contact Preference: </span>
                    <strong className="capitalize">{selectedCase.preferred_contact_method.replace('_', ' ')}</strong>
                  </div>
                  <div>
                    <span className="text-muted-earth">Urgency Level: </span>
                    <strong className="capitalize text-[#1C3A13] font-mono">{selectedCase.urgency_level.replace('_', ' ')}</strong>
                  </div>
                </div>
              </div>

              {/* Student Notes / Concerns */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-earth">
                  Student's Stated Concerns
                </label>
                <div className="p-3.5 rounded-xl bg-sand/30 border border-beige text-xs text-earth leading-relaxed">
                  {selectedCase.notes || <span className="text-muted-earth italic">No additional notes provided by student.</span>}
                </div>
              </div>

              {/* Triage Status Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-earth">
                  Triage Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-sand/40 border border-beige rounded-xl px-3 py-2 text-xs text-earth focus:outline-none focus:border-deep-sage font-medium"
                >
                  <option value="pending">Pending (Unreviewed)</option>
                  <option value="assigned">Assigned (Counsellor Designated)</option>
                  <option value="contacted">Contacted (Outreach Initiated)</option>
                  <option value="completed">Completed (Support Provided)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Confidential Clinical Notes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-earth">
                    Confidential Practitioner Notes
                  </label>
                  <span className="text-[10px] text-muted-earth flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-deep-sage" /> Only visible to authorized counsellors
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record confidential outreach timestamp, consultation schedule, or clinical triage summary..."
                  className="w-full p-3 bg-sand/40 border border-beige rounded-xl text-xs text-earth focus:outline-none focus:border-deep-sage leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-beige bg-surface-raised flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={closeCaseModal} disabled={isUpdating}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveCaseUpdate}
                disabled={isUpdating}
                leftIcon={<UserCheck className="w-4 h-4" />}
              >
                {isUpdating ? 'Saving...' : 'Save Case Status'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
