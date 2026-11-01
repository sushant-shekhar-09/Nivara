import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ShieldCheck, ArrowRight, Eye, EyeOff, Building2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'counsellor') {
        navigate('/counsellor');
      } else if (['admin', 'institution_admin', 'platform_admin'].includes(user.role)) {
        navigate('/admin');
      } else if (user.role === 'org_admin') {
        navigate('/org/dashboard');
      } else {
        navigate('/screening');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      const stateDestination = (location.state as any)?.from?.pathname;
      if (stateDestination && stateDestination !== '/login') {
        navigate(stateDestination);
      } else {
        const storedUser =
          localStorage.getItem('nivara_user') || localStorage.getItem('studentmind_user');
        const role = storedUser ? JSON.parse(storedUser).role : '';
        if (role === 'counsellor') {
          navigate('/counsellor');
        } else if (['admin', 'institution_admin', 'platform_admin'].includes(role)) {
          navigate('/admin');
        } else if (role === 'org_admin') {
          navigate('/org/dashboard');
        } else {
          navigate('/screening');
        }
      }
    } catch (err: any) {
      setError(
        err.detail ||
          'Authentication failed. Please check your credentials or ensure the backend server is active.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      formMaxWidth="md"
      backLinkHref="/"
      backLinkLabel="Return to Nivara"
      scrollable={false}
    >
      <div className="space-y-4 sm:space-y-5">
        {/* Editorial Heading */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#536044] font-semibold block">
            Clinical Governance Portal
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1C3A13] font-normal tracking-tight">
            Staff & Counsellor Sign In
          </h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-[#536044]/10 border border-[#536044]/30 text-[#1C3A13] text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#536044]" />
            <span className="font-sans leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 font-sans">
          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
              Staff Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#77766C]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="counsellor@institution.ac.in"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#77766C]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
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

          <div className="pt-1.5">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading}
              className="w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 bg-[#1C3A13] hover:bg-[#2b541d] text-[#FCFCF7] shadow-sm transition-all"
            >
              {isLoading ? (
                <span>Authenticating Staff Access...</span>
              ) : (
                <>
                  <span>Sign In to Staff Portal</span>
                 
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Auxiliary Switch Links */}
        <div className="pt-3.5 border-t border-[#DAD4C8]/60 space-y-2 font-sans text-xs">
          <div className="flex items-center justify-between text-[#77766C]">
            <span>Need an institutional account?</span>
            <Link
              to="/org/login"
              className="font-medium text-[#1C3A13] hover:underline flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Organization Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </AuthSplitLayout>
  );
};
