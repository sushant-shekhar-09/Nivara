import React, { useState } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
  User,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { submitCounsellingRequest } from '../../lib/api';

interface CounsellingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUrgency?: 'standard' | 'priority' | 'immediate_support';
  tenantSlug?: string;
}

export const CounsellingRequestModal: React.FC<CounsellingRequestModalProps> = ({
  isOpen,
  onClose,
  defaultUrgency = 'standard',
  tenantSlug = 'demo-univ',
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<'email' | 'phone' | 'in_person'>('email');
  const [urgencyLevel, setUrgencyLevel] = useState<'standard' | 'priority' | 'immediate_support'>(defaultUrgency);
  const [notes, setNotes] = useState('');
  const [consentToContact, setConsentToContact] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    if (!studentName.trim() || !studentEmail.trim()) {
      setErrorNotice('Please provide your name and university email address.');
      return;
    }

    if (!consentToContact) {
      setErrorNotice('Affirmative consent is required for the campus counselling team to reach out.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitCounsellingRequest({
        tenant_slug: tenantSlug,
        student_name: studentName.trim(),
        student_email: studentEmail.trim(),
        student_phone: studentPhone.trim() || undefined,
        preferred_contact_method: preferredContact,
        urgency_level: urgencyLevel,
        notes: notes.trim() || undefined,
        consent_to_contact: true,
      });

      setSubmittedCaseId(res.id);
    } catch (err: any) {
      setErrorNotice(err?.detail || err?.message || 'Failed to submit request. Please try again or call the helpline.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedCaseId(null);
    setStudentName('');
    setStudentEmail('');
    setStudentPhone('');
    setNotes('');
    setConsentToContact(false);
    setErrorNotice(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-earth/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-ivory border border-beige rounded-3xl max-w-lg w-full shadow-organic overflow-hidden flex flex-col max-h-[92vh] font-sans">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-beige bg-surface-raised flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-deep-sage/10 text-deep-sage">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-earth">
                Request Campus Counselling
              </h3>
              <p className="text-[11px] text-muted-earth">
                Direct, confidential connection with your university wellness center
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-muted-earth hover:text-earth text-lg font-bold p-1 rounded-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-earth">
          {submittedCaseId ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-deep-sage/15 text-deep-sage flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-serif font-bold text-2xl text-earth">
                Outreach Request Received
              </h4>
              <p className="text-xs text-muted-earth max-w-md mx-auto leading-relaxed">
                Thank you for reaching out. A licensed campus counsellor has received your request and will contact you via your preferred method (<strong className="capitalize">{preferredContact}</strong>).
              </p>
              <div className="p-3 bg-sand/60 rounded-xl border border-beige inline-block font-mono text-[11px] text-deep-sage">
                Reference ID: {submittedCaseId.slice(0, 13)}
              </div>
              <div className="pt-4">
                <Button variant="primary" onClick={handleResetAndClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Privacy Shield Notice */}
              <div className="p-3.5 rounded-xl bg-sand/50 border border-beige flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-deep-sage flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-earth leading-relaxed">
                  <strong>Zero-Linkage Privacy Guarantee:</strong> Your survey scores remain anonymous and are <em>never</em> attached to this referral. Only your contact information and notes below are sent to the verified campus counselling team.
                </p>
              </div>

              {errorNotice && (
                <div className="p-3 rounded-xl bg-crimson/10 border border-crimson/30 text-crimson text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorNotice}</span>
                </div>
              )}

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-earth uppercase tracking-wider">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-earth" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sen"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-sand/40 border border-beige rounded-xl focus:outline-none focus:border-deep-sage text-earth"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-earth uppercase tracking-wider">
                    University Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-earth" />
                    <input
                      type="email"
                      required
                      placeholder="student@univ.edu"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-sand/40 border border-beige rounded-xl focus:outline-none focus:border-deep-sage text-earth"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Contact Preference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-earth uppercase tracking-wider">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-earth" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-sand/40 border border-beige rounded-xl focus:outline-none focus:border-deep-sage text-earth"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-earth uppercase tracking-wider">
                    Contact Method
                  </label>
                  <select
                    value={preferredContact}
                    onChange={(e: any) => setPreferredContact(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-sand/40 border border-beige rounded-xl focus:outline-none focus:border-deep-sage text-earth"
                  >
                    <option value="email">Email Outreach</option>
                    <option value="phone">Phone / WhatsApp</option>
                    <option value="in_person">In-Person Consultation</option>
                  </select>
                </div>
              </div>

              {/* Urgency */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-earth uppercase tracking-wider">
                  Support Urgency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgencyLevel('standard')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      urgencyLevel === 'standard'
                        ? 'border-deep-sage bg-deep-sage/10 font-bold text-deep-sage'
                        : 'border-beige bg-sand/20 text-muted-earth'
                    }`}
                  >
                    Routine
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgencyLevel('priority')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      urgencyLevel === 'priority'
                        ? 'border-[#536044] bg-[#536044]/15 font-bold text-[#1C3A13]'
                        : 'border-beige bg-sand/20 text-muted-earth'
                    }`}
                  >
                    Priority
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgencyLevel('immediate_support')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      urgencyLevel === 'immediate_support'
                        ? 'border-crimson bg-crimson/15 font-bold text-crimson'
                        : 'border-beige bg-sand/20 text-muted-earth'
                    }`}
                  >
                    Immediate
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-earth uppercase tracking-wider">
                  What would you like to discuss? (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Feeling overwhelmed with midterms, difficulty sleeping, or looking for stress coping strategies..."
                  className="w-full p-2.5 bg-sand/40 border border-beige rounded-xl text-xs text-earth focus:outline-none focus:border-deep-sage"
                />
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={consentToContact}
                  onChange={(e) => setConsentToContact(e.target.checked)}
                  className="mt-0.5 rounded border-beige text-deep-sage focus:ring-deep-sage"
                />
                <span className="text-[11px] text-muted-earth leading-relaxed">
                  I give affirmative consent for my university's mental health support team to contact me via the details provided above.
                </span>
              </label>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-beige">
                <Button type="button" variant="outline" size="sm" onClick={handleResetAndClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={loading || !consentToContact}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
