import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { loginOrganization } from '../lib/api';
import { Button } from '../components/ui/Button';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';

export const OrgLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/org/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your official institutional email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await loginOrganization({ email, password });
      loginWithToken(response, email);
      const destination = (location.state as any)?.from?.pathname || '/org/dashboard';
      navigate(destination);
    } catch (err: any) {
      setError(
        err.detail ||
        err.message ||
        'Institutional authentication failed. Please verify credentials or contact platform support.'
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
      <div className="space-y-5 sm:space-y-6">
        {/* Clean Editorial Heading (No logo above heading) */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#536044] font-semibold block">
            Institutional Portal
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1C3A13] font-normal tracking-tight">
            Organization Sign In
          </h1>
         
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-[#536044]/10 border border-[#536044]/30 text-[#1C3A13] text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#536044]" />
            <span className="font-sans leading-relaxed">{error}</span>
          </div>
        )}

        {/* Focused Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 font-sans">
          {/* Institutional Email */}
          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
              Official Institutional Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#77766C]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@university.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DAD4C8] bg-[#FCFCF7] text-sm text-[#2F302B] placeholder-[#77766C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password with Visibility Toggle */}
          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#77766C]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Submit Action */}
          <div className="pt-1.5">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading}
              className="w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 bg-[#1C3A13] hover:bg-[#2b541d] text-[#FCFCF7] shadow-sm transition-all"
            >
              {isLoading ? (
                <span>Authenticating Workspace...</span>
              ) : (
                <>
                  <span>Sign In to Organization Dashboard</span>
                 
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Auxiliary Links */}
        <div className="pt-4 border-t border-[#DAD4C8]/60 space-y-2.5 font-sans text-xs">
          <div className="flex items-center justify-between text-[#77766C]">
            <span>Need an institutional template?</span>
            <Link
              to="/org/register"
              className="font-medium text-[#1C3A13] hover:underline flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Register Institution</span>
            </Link>
          </div>

          <div className="flex items-center justify-between text-[#77766C]">
            <span>Are you a clinic counsellor?</span>
            <Link
              to="/login"
              className="font-medium text-[#77766C] hover:text-[#1C3A13] hover:underline flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff & Clinic Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </AuthSplitLayout>
  );
};
