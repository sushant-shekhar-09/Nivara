import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  User,
  Globe,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { registerOrganization, type OrganizationRegisterRequest } from '../lib/api';
import { Button } from '../components/ui/Button';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';

export const OrgRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<OrganizationRegisterRequest>({
    name: '',
    org_type: 'university',
    official_email: '',
    contact_person_name: '',
    contact_person_designation: '',
    contact_phone: '',
    country: 'India',
    state: '',
    city: '',
    website: '',
    description: '',
    password: '',
    password_confirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.password_confirm) {
      setError('Password and confirmation do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await registerOrganization({
        ...formData,
        contact_name: formData.contact_person_name,
        contact_designation: formData.contact_person_designation,
      });
      setSuccess('Institutional account created successfully. Redirecting to workspace sign-in...');
      setTimeout(() => {
        navigate('/org/login');
      }, 1500);
    } catch (err: any) {
      setError(
        err.detail ||
        err.message ||
        'Registration failed. Please check institutional details or official organizational email.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout formMaxWidth="2xl" backLinkHref="/" backLinkLabel="Return to Nivara">
      <div className="space-y-8">
        {/* Editorial Heading (No logo above heading) */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#536044] font-semibold block">
            Institutional Partnership
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C3A13] font-normal tracking-tight">
            Register Your Institution
          </h1>
         
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-[#536044]/10 border border-[#536044]/30 text-[#1C3A13] text-xs flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#536044]" />
            <div className="font-sans leading-relaxed">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-4 rounded-2xl bg-[#1C3A13]/10 border border-[#1C3A13]/30 text-[#1C3A13] text-xs flex items-start gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#1C3A13]" />
            <div className="font-sans font-medium">{success}</div>
          </div>
        )}

        {/* Multi-Section Form (Independent vertical scrolling, no clipped card) */}
        <form onSubmit={handleSubmit} className="space-y-8 font-sans">
          {/* ======================================================== */}
          {/* SECTION 1: ORGANIZATION PROFILE */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#DAD4C8]">
              <Building2 className="w-4 h-4 text-[#1C3A13]" />
              <h2 className="text-xs font-mono font-semibold text-[#1C3A13] uppercase tracking-wider">
                1. Organization Profile
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
                  Institution / Organization Name <span className="text-[#536044]">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. National Institute of Technology or Greenfield University"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
                  Organization Type <span className="text-[#536044]">*</span>
                </label>
                <select
                  name="org_type"
                  value={formData.org_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
                >
                  <option value="university">University / Higher Education</option>
                  <option value="college">Undergraduate College</option>
                  <option value="school">Secondary / High School</option>
                  <option value="student_org">Student Support Organization</option>
                  <option value="ngo">Mental Health NGO / Non-Profit</option>
                  <option value="other">Other Eligible Organization</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
                  Official Institutional Email <span className="text-[#536044]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#77766C]" />
                  <input
                    type="email"
                    name="official_email"
                    required
                    value={formData.official_email}
                    onChange={handleChange}
                    placeholder="wellness@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[10px] text-[#77766C] font-sans">
                  Must use official academic domain (@edu, @ac.in, or institutional domain).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
                  Official Website (Optional)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 w-4 h-4 text-[#77766C]" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.institution.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
                  Campus Department / Scope
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 w-4 h-4 text-[#77766C]" />
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g. Student Wellness Center / Dean of Students"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: AUTHORIZED REPRESENTATIVE */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#DAD4C8]">
              <User className="w-4 h-4 text-[#1C3A13]" />
              <h2 className="text-xs font-mono font-semibold text-[#1C3A13] uppercase tracking-wider">
                2. Authorized Institutional Representative
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
                  Full Name <span className="text-[#536044]">*</span>
                </label>
                <input
                  type="text"
                  name="contact_person_name"
                  required
                  value={formData.contact_person_name}
                  onChange={handleChange}
                  placeholder="Prof. Ananya Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
                  Designation / Role <span className="text-[#536044]">*</span>
                </label>
                <input
                  type="text"
                  name="contact_person_designation"
                  required
                  value={formData.contact_person_designation}
                  onChange={handleChange}
                  placeholder="Dean of Student Affairs"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
                  Direct Contact Phone <span className="text-[#536044]">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#77766C]" />
                  <input
                    type="tel"
                    name="contact_phone"
                    required
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: LOCATION & JURISDICTION */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#DAD4C8]">
              <MapPin className="w-4 h-4 text-[#1C3A13]" />
              <h2 className="text-xs font-mono font-semibold text-[#1C3A13] uppercase tracking-wider">
                3. Location & Jurisdiction
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
                  City <span className="text-[#536044]">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
                  State / Province <span className="text-[#536044]">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Karnataka"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
                  Country <span className="text-[#536044]">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="India"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 4: SECURITY CREDENTIALS */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#DAD4C8]">
              <Lock className="w-4 h-4 text-[#1C3A13]" />
              <h2 className="text-xs font-mono font-semibold text-[#1C3A13] uppercase tracking-wider">
                4. Account Credentials
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
                  Password (min 8 chars) <span className="text-[#536044]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#77766C]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 rounded-lg text-[#77766C] hover:text-[#2F302B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C3A13]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
                  Confirm Password <span className="text-[#536044]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#77766C]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password_confirm"
                    required
                    value={formData.password_confirm}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 p-1 rounded-lg text-[#77766C] hover:text-[#2F302B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C3A13]"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          
          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 bg-[#1C3A13] hover:bg-[#2b541d] text-[#FCFCF7] shadow-sm transition-all"
            >
              {isLoading ? (
                <span>Registering Institutional Account...</span>
              ) : (
                <>
                  <span>Create Institutional Account</span>
                  
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Existing Login Prompt */}
        <div className="pt-6 border-t border-[#DAD4C8]/60 text-center text-xs text-[#77766C] font-sans">
          <span>Already registered your organization? </span>
          <Link to="/org/login" className="font-semibold text-[#1C3A13] hover:underline">
            Log in to Organization Portal
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
};
