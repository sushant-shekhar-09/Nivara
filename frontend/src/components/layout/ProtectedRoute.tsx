import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth, type UserRole } from '../../lib/auth';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
  allowGuest?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  allowGuest = false,
}) => {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Verifying confidential session...
          </span>
        </div>
      </div>
    );
  }

  // If not authenticated and guests are not permitted on this route
  if (!isAuthenticated && !allowGuest) {
    const redirectPath = location.pathname.startsWith('/org') ? '/org/login' : '/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If roles are specified and user is logged in, verify permissions
  if (allowedRoles && user && !hasRole(...allowedRoles)) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <Card variant="bento" padding="lg" className="border-amber-200 dark:border-amber-900/60">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                Restricted Role Access
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This portal requires one of the following roles:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {allowedRoles.join(', ')}
                </strong>
                . You are currently authenticated with the{' '}
                <span className="font-semibold text-teal-700 dark:text-teal-400">
                  {user.role}
                </span>{' '}
                role.
              </p>
              <div className="pt-3 flex flex-wrap items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  onClick={() => window.history.back()}
                >
                  Return to Previous Page
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<LogIn className="w-3.5 h-3.5" />}
                  onClick={() => {
                    window.location.href = '/login';
                  }}
                >
                  Switch Account
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return children ? <>{children}</> : null;
};
