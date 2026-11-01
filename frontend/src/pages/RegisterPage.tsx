import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/screening');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both an email address and a password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register(email, password, role);
      navigate('/screening');
    } catch (err: any) {
      setError(
        err.detail ||
          'Registration failed. This email may already be registered or backend is unreachable.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout formMaxWidth="md" backLinkHref="/" backLinkLabel="Return to Nivara">
      <div className="space-y-8">
        {/* Editorial Heading */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#536044] font-semibold block">
            Access Setup
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C3A13] font-normal tracking-tight">
            Create an Account
          </h1>
          <p className="font-sans text-sm text-[#77766C] leading-relaxed">
            Register to maintain screening history, access cohort tools, or connect with your campus clinic.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-[#536044]/10 border border-[#536044]/30 text-[#1C3A13] text-xs flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#536044]" />
            <span className="font-sans leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 font-sans">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-[#77766C]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@institution.ac.in"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
              Account Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all cursor-pointer"
            >
              <option value="student">Student (Standard Assessment Access)</option>
              <option value="counsellor">Counsellor (Authorized Case Review)</option>
              <option value="admin">Administrator (Governance & System)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
              Password (min 6 chars)
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-[#77766C]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                minLength={6}
                className="w-full pl-11 pr-11 py-3 rounded-2xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 p-1 rounded-lg text-[#77766C] hover:text-[#2F302B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C3A13]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 bg-[#1C3A13] hover:bg-[#2b541d] text-[#FCFCF7] shadow-sm transition-all"
            >
              {isLoading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Existing Login Prompt */}
        <div className="pt-6 border-t border-[#DAD4C8]/60 text-center text-xs text-[#77766C] font-sans">
          <span>Already have an account? </span>
          <Link to="/login" className="font-semibold text-[#1C3A13] hover:underline font-mono">
            Sign In
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
};
